import { nextTick } from 'vue';
// import { v4 as uuid } from 'uuid';
import { log } from '@/utils/logger';
import { fetch, create, save, remove, validateData } from '@/utils/supabase';
// import { useSortable } from '@/composables';
import { moduleSize } from '@/constants';
import { blank } from './';

import type { Patch, Module, Connection } from '@/types';


// -----------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

/**
 * Loads and instantiates a patch from the Store. This includes setting up
 * `modules`, `configs`, routing audio, and applying any `parameters`.
 *
 * NOTE: we cannot load `modules`, `connections`, and `parameters` all at once.
 *       Modules must be mounted first so that all AudioNodes are available
 *       to the `connections`; likewise the `configs` need to be available
 *       before `parameters` are instantiated.
 *
 * @this {Store} reference to the pinia store
 * @param {number} id The id of the patch to load
 */
export function loadPatch(id?: number) {
  // const { resetSorting } = useSortable();
  const store = this;

  if (id === store.patchId) return;
  id = id ?? store.patchId as number;

  const connections = store.patches[id].connections; // keep a ref to the _soon-to-be-loaded_ connections array
  const configs = store.patches[id].configs;         // keep a ref to the _soon-to-be-loaded_ parameter configs
  store.patches[id].connections = [];                // temporarily zero it out
  store.patches[id].configs = [{ parameters: {}}];   // temporarily zero it out

  store.patchId = id;                                // trigger loading a new patch
  store.configId = 0;                                // select 1st set when new patch loaded
  log({ type:'patch', action:'loading ', data: store.patch.name });

  // ensure AudioNodes have been instantiated before proceeding with routing
  // ensure components w/ parameters have mounted before applying parameter configs
  nextTick(() => {
    store.patch.connections = connections;
    store.patch.configs = configs;
    // resetSorting();
  });
};


/**
 * Save the current working patch into the backend database, and persist it
 * into localStorage as well.
 * @param  {[type]} commit [description]
 * @param  {PatchState} state The current state of the Patch
 * @param  {Object} data Patch and parameter names, other patch data  [TODO] this doesnt currently get used.
 * @return {void}
 */
export const savePatch = ({ commit, state }, data) => {
  const key = state.patchKey;
  const patch = {
    id: state.id,
    name: state.name,
    modules: state.modules,
    connections: state.connections,
    parameterSets: state.parameterSets
  };

  // Update patch in Database
  api.save('patch/' + key, patch)
    .then(() => {
      console.log('saved: ', patch.name);
    })
    .catch((err) => {
      console.log(err);
    });

  // Update patch in localStorage
  commit('SAVE_PATCH', {
    key,
    patch
  });
};


/**
 * Insert a new, blank patch into the workspace.
 * @this Store The Vue (pinia) store instance.
 */
export function addPatch () {
  this.patchId = this.patches.push(blank()) - 1;
  this.configId = 0;

  // for tests
  // increments id
  // no duplicate ids
};


/**
 * Remove a patch.
 * @this {Store} reference to the pinia store
 * @param {number} id The id of the patch to load
 */
export function removePatch(id?: number) {
  if (this.patches.length === 1) {
    alert('no');
    return;
  }

  log({ type:'patch', action:'deleting', data: this.patch.name });

  // remove(this.patch._uuid);

  this.patches.splice(id, 1);
  this.patchId = 0;
  this.loadPatch(); // loadPatch(0)
};


/**
 * Fetch all of the user's patches from the API
 */
export async function fetchPatches() {
  // api.load('/patches')
  //   .then((patches) => {
  //     console.log('%c Patches synched from API ', 'background:#666;color:white;font-weight:bold;');
  //     // commit('SET_PATCHES', patches);
  //     this.patches = validateData(patches); // patches;
  //   })
  //   .catch(() => {
  //     console.log('Not signed in.');
  //   });
  try {
    const patches = await fetch();
    console.log('%c Patches synched from API ', 'background:#666;color:white;font-weight:bold;');
    // this.patches = validateData(patches);
  } catch (err) {
    console.log('Not signed in.', err);
  };

};



// -----------------------------------------------
//  APP
// -----------------------------------------------

export function togglePower() { this.power = !this.power; }
export function toggleMode() { this.isEditing = !this.isEditing; }

// better name: MODULES? MODULEREGISTRY ...?  WEBAUDIO_NODES?
export function addToRegistry({ id, node }) { this.registry[id] = node; }
export function removeFromRegistry (id) { delete this.registry[id]; }


/**
 * @this Store The vue (pinia) store instance.
 */
export function setActive(id) { this.activeId = id; }
export function clearActive() { this.activeId = undefined; }
export function setFocus(id) { this.focusedId = id; }
export function clearFocus() { this.focusedId = undefined; }




// -----------------------------------------------
//  PATCH
// -----------------------------------------------

/**
 * Adds a new module to the patch.
 * @this
 * @param {Object} data A partial serialized Module object
 * @param {string} data.type
 * @param {number} data.x
 * @param {number} data.y
 */
export function addModule(data: Partial<Module>) {
  const { type, x, y } = data;
  const patch = this.patch as Patch;
  const size = moduleSize[type] || [1, 1];

  patch.id++;     // or uuid
  patch.modules.push({
    id: patch.id,
    type: type,
    x: x || 0,    // for dragging X position
    y: y || 0,    // for dragging Y position
    col: 0,       // for rack X position
    row: 0,       // for rack Y position
    w: size[0],   // for rack width
    h: size[1]    // for rack height
  } as Module);
}

/**
 * Removes (deletes) the currently _active_ module.
 * @this
 */
export function removeModule() {
  let { activeId, focusedId, modules, connections } = this;

  // only delete active/focusedId modules
  if (activeId === focusedId) {
    modules = modules.filter((m) => m.id !== activeId);
    // this.patches[this.patchKey].modules = modules;

    try {
      this.patch.modules = modules;
      this.modules = modules;
    } catch (e) { console.log('why', e) }

    connections.forEach((connection) => {
      if (connection.to.id === activeId || connection.from.id === activeId) {
        // connections = connections.filter((c) => c.id !== connection.id);
        removeConnection(connection.id);
      }
    });

    // Note: KNOB / SLIDERS will remove themselves, yay!
  }
}

/**
 * Adds a new connection between two modules, in the patch.
 * @this
 * @param {Connection} data The serialized connection object
 */
export function addConnection(data: Connection) {
  this.connections.push(data);
}

/**
 * Removes (deletes) a connection by its id.
 * @this
 */
export function removeConnection(id) {
  const { patch, connections } = this;
  patch.connections = connections.filter((c) => c.id !== id);
}


// -----------------------------------------------
//  PARAMETERS
// -----------------------------------------------

/**
 * Adds an new, empty parameter-configuration object.
 * @this
 */
export function addConfig() {
  const config = {
    name: '<empty>',
    parameters: Object.assign({}, this.config?.parameters)
  };

  this.configId = this.configs.push(config) - 1; // select new config by default (push returns array length)
}


/**
 * Remove a set of parameters.
 * @param {number} id The configuration to remove
 */
export function removeConfig(id: number) {
console.log('remoeing', id);
  this.configs.splice(id, 1);
  this.configId = 0;
}

export function setParameter (data) {
  if (this.parameters) {
    this.parameters[data.id] = data.value;
  }
};

// export function REGISTER_PARAMETER (state, id) {
//   const key = state.parameterKey;
//   const set = state.parameterSets[key];

//   if (set && !set.parameters[id]) {
//     set.parameters[id] = 0;
//     console.log(id, ' registered');
//   } else {
//     console.log(id, ' was already present');
//   }
// };

export function removeParameter (id) {
  // this.configs.forEach(set => {
  //   if (set.parameters[id]) {
  //     delete set.parameters[id];
  //   }
  // });
  delete this.config.parameters[id];
};



// -----------------------------------------------
//  UI
// -----------------------------------------------

/**
 * @this Store The vue (pinia) store instance.
 */
export function updateGridPosition({ id, x, y }) {
  // const module = state.modules.find((m) => m.id === data.id);

  // const module = this.getModule(id);
  // module.x = x;
  // module.y = y;

  this.activeModule.x = x;
  this.activeModule.y = y;
}

export function updateRackPosition(data) {
  const module = this.modules.find((m) => m.id === data.id);

  module.col = data.col;
  module.row = data.row;
};
