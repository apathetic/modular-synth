import Vue from 'vue';
import { api, generateKey } from './firebase';
import { _NAME, _MODULES, _CONNECTIONS, _PARAMETERS } from './index';
import { DEFAULT } from '../schema';
import { Action } from 'vuex/types';


// -----------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

/**
 * Load a Patch from the Store; patches that have been previously fetched and
 * cached may be loaded directly, else fallback to localStorage.
 *
 * NOTE: we cannot load modules, connections, and parameters all at once.
 *       Modules must be mounted _first_, so that the AudioNode is available
 *       to the Connections; likewise with the Modules' settings being
 *       available to the Parameters.
 *
 * @param  {[type]} commit [description]
 * @param  {[type]} state  [description]
 * @param  {String} key    The key of the patch to load
 * @return {void}
 */
export const loadPatch = ({ commit, state }, key) => {
  let patch;

  key = key || state.patchKey;    // load a specific patch, or whatever current key is (from localStorage)

  // if loading patch via a specific key
  if (key && state.patches[key]) {
    patch = state.patches[key];
    commit('SET_KEY', key);
    console.log('%c Loading patch: %s ', 'background:#666;color:white;font-weight:bold;', patch.name);
  } else {
    console.log('%c Loading patch from localStorage ', 'background:#666;color:white;font-weight:bold;');
    patch = {
      id: parseInt(localStorage.getItem('id')) || DEFAULT.id,
      name: localStorage.getItem(_NAME) || DEFAULT.name,
      modules: JSON.parse(localStorage.getItem(_MODULES)) || DEFAULT.modules,
      connections: JSON.parse(localStorage.getItem(_CONNECTIONS)) || DEFAULT.connections,
      parameterSets: JSON.parse(localStorage.getItem(_PARAMETERS)) || DEFAULT.parameterSets
    };
  }

  commit('LOAD_PATCH', patch); // load: id, name, modules, and parameterSets
  commit('LOAD_CONNECTIONS', []); // first, explicitly destroy all connections

  // ensure nodes (+ inlets/outlets) are in the DOM...
  Vue.nextTick(function() {
    // ...then load new connections
    console.log('%c Routing audio... ', 'background:#666;color:white;font-weight:bold;');
    commit('LOAD_CONNECTIONS', patch.connections);

    // ...lastly, load parameters
    // commit('LOAD_PARAMETERS', patch.parameters);
  });
};

/**
 * Save the current working patch into the backend database, and persist it
 * into localStorage as well.
 * @param  {[type]} commit [description]
 * @param  {[type]} state  [description]
 * @param  {Object} data   Patch and parameter names, other patch data
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
 * @param {[type]} commit [description]
 * @param {[type]} state  [description]
 */
export const addPatch = ({ commit, state }) => {
  const key = generateKey();

  // Create new patch in Database
  api.create(key, DEFAULT);

  // Create new patch in localStorage
  commit('SAVE_PATCH', {
    key,
    patch: DEFAULT
  });

  // Update App keys
  state.patchKey = key;
  state.parameterKey = 0;
};

/**
 * Remove a patch.
 * @param {[type]} commit [description]
 * @param {[type]} state  [description]
 */
export const removePatch = ({ commit, state }, key) => {
  api.remove('patch/' + key);
  commit('REMOVE_PATCH', key);

  // Update App keys
  state.patchKey = Object.keys(state.patches)[0];   // choose first key (oldest)
  state.parameterKey = 0;
  loadPatch({ commit, state });
};

/**
 * Fetch all of the user's patches from the backend.
 * @param  {[type]} commit [description]
 * @return {[type]}        [description]
 */
@Action
export const fetchPatches = ({ commit }) => {
  api.load('/patch')
    .then((patches) => {
      console.log('%c Patches synched from API ', 'background:#666;color:white;font-weight:bold;');
      commit('SET_PATCHES', patches);
    })
    .catch(() => {
      console.log('Not signed in.');
    });
};


// -----------------------------------------------
//  APP
// -----------------------------------------------

export const togglePower = ({ commit }) => {
  commit('TOGGLE_POWER');
};

export const toggleEditMode = ({ commit }) => {
  commit('TOGGLE_EDIT');
};


// -----------------------------------------------
//  UI
// -----------------------------------------------

export const setActive = ({ commit }, id) => {
  commit('SET_ACTIVE', id);
};

export const clearActive = ({ commit }) => {
  // commit('CLEAR_ACTIVE');
};

// TODO ----------------- move to VUE BUS ? or within App.vue only ...?
// $emit event ... only connecting.vue needs this...
export const setFocus = ({ commit }, id) => {
  commit('SET_FOCUS', id);
};

export const clearFocus = ({ commit }) => {
  commit('CLEAR_FOCUS');
};
// ---------------------------------------


// -----------------------------------------------
//  MODULES
// -----------------------------------------------

export const addModule = ({ commit }, data) => {
  commit('ADD_MODULE', data);
};

export const removeModule = ({ commit, state }) => {
  // only delete active/focused modules
  if (state.active === state.focused) {
    const id = state.active;

    commit('REMOVE_MODULE', id);

    state.connections.forEach((connection) => {
      if (connection.to.id === id || connection.from.id === id) {
        commit('REMOVE_CONNECTION', connection.id);
      }
    });

    // Note: KNOB / SLIDERS will remove themselves, yay!
  }
};


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------

// export const addConnection = ({ commit }, outlet) => {
//   commit('ADD_CONNECTION', outlet.port);
// };

export const removeConnection = ({ commit }, id) => {
  commit('REMOVE_CONNECTION', id);
};
