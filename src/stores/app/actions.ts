import { nextTick } from 'vue';
import { v4 as uuid } from 'uuid';
import { log } from '@/utils/logger';
import { fetch, create, save, validateData } from '@/utils/supabase';
import { useSortable } from '@/composables';
import { moduleSize } from '@/constants';
import { blank } from './';

import type { Patch } from '@/types';


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
 * @param {number} id The key of the patch to load
 * @return {void}
 */
export function loadPatch(id?: number) {
  const { resetSorting } = useSortable();

  if (id === this.patchId) return;
  id = id ?? this.patchId;

  log({ type:'patch', action:'loading ', data:this.patch.name });
  const connections = this.patches[id].connections; // keep a ref to the _soon-to-be-loaded_ connections array
  const configs = this.patches[id].configs;         // keep a ref to the _soon-to-be-loaded_ parameter configs
  this.patches[id].connections = [];                // temporarily zero it out
  this.patches[id].configs = [{ parameters: {}}];   // temporarily zero it out

  this.patchId = id;                                // trigger loading a new patch
  this.configId = 0; // select 1st set when new patch loaded


  // working IDEA OLD
  // commit('LOAD_PATCH', patch);      // loads: id, name, modules, and parameterSets. NO connections / parameterKey
  // commit('LOAD_CONNECTIONS', []);   // first, explicitly destroy all connections
  // commit('SET_PARAMETERS_KEY', -1); // and temp unset this so that it'll trigger a mutation on next tick

  // patch.connections = []; // first, explicitly destroy all connections



  // ensure nodes (+ inlets/outlets) are in the DOM
  // before proceeding with routing, applying params
  nextTick(() => {


    // ...then load new connections
    log({ type:'patch', action:'routing audio...' });
    this.patch.connections = connections;

    // ...lastly, load parameters
    log({ type:'patch', action:'setting parameters...' });
    this.patch.configs = configs;

    // ...
    log({ type:'patch', action:'resetting grid...' });
    resetSorting();


    // deterime MasterOut's position
    // actually... NOT NECESSARY if we blow away ALL MODULES each
    // time we load a patch
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
  // const id = uuid(); // generateKey();
  // const patch = Object.assign(blank(), { id });
  // this.patchId = this.patches.push(patch) - 1;

  this.patchId = this.patches.push(blank()) - 1;
  this.configId = 0;
};


/**
 * Remove a patch.
 * @param {[type]} commit [description]
 * @param {[type]} state  [description]
 */
export const removePatch = ({ commit, state }, key) => {
  if (state.patches.length === 1) {
    alert('no');
    return;
  }

  api.remove('patch/' + key);
  commit('REMOVE_PATCH', key);

  state.patchId = 0; // Object.keys(state.patches)[0];   // choose first key (oldest)
  state.configId = 0;
  loadPatch({ commit, state });
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
 * @this
 */
export function addModule(data) {
  const patch = this.patch as Patch;
  const type = data.type;
  const pos = data.coords || [0, 0];
  const size = moduleSize[type] || [1, 1];

  if (!patch) {
    throw Error ('Err... there should be a `patch`');
  }

  patch.id++; // or patch.modules.length.  or uuid
  // TODO: state.modules[state.id] = {... } ?
  patch.modules.push({
    id: patch.id,
    type: type,
    x: pos[0],    // for dragging X position
    y: pos[1],    // for dragging Y position
    col: 0,       // for rack X position
    row: 0,       // for rack Y position
    w: size[0],   // for rack width
    h: size[1]    // for rack height
  });
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

export function addConnection(data) {
  this.connections.push(data);
}

export function removeConnection(id) {
  let { activeId, focusedId, modules, connections } = this;
  this.connections = connections.filter((c) => c.id !== id);
}

// export const REMOVE_CONFIG = (state, key) => {
//   state.configs.splice(key, 1); // let's try mutating the array directly
// };

// -----------------------------------------------
//  PARAMETERS
// -----------------------------------------------

/**
 * Adds an new, empty parameter configuration object.
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
 * @param id The configuration to remove
 */
export function removeConfig(id) {
  this.configs.splice(id, 1);
  this.configId = 0;
}

export function setParameter (data) {
  if (this.parameters) {
    this.parameters[data.id] = data.value;
  }
};

export function REGISTER_PARAMETER (state, id) {
  const key = state.parameterKey;
  const set = state.parameterSets[key];

  if (set && !set.parameters[id]) {
    set.parameters[id] = 0;
    console.log(id, ' registered');
  } else {
    console.log(id, ' was already present');
  }
};

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
