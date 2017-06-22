import Vue from 'vue';
import { api, generateKey } from './firebase';
import { _NAME, _MODULES, _CONNECTIONS, _PARAMETERS } from './index';

let blank = {   // TODO make this (object) live somewhere universal
  id: 0,
  name: 'Blank',
  modules: [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
  connections: [],
  parameterSets: []
};

// -----------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

// THIS is important: we cannot load modules, connections, parameters
// all at once. Modules must be mounted _first_, so that the AudioNode
// is a available to the Connections; likewise with the Modules'
// settings being availble to the Parameters.
export const loadPatch = ({ commit, state }, key) => {
  let patch;

  key = key || state.patchKey;    // load a specific patch, or whatever current key is
  console.log('-----------------------------');

  // if loading patch via a specific key
  if (key && state.patches[key]) {
    console.log('Loading patch: ', key);
    patch = state.patches[key];
    commit('SET_KEY', key);
  } else {
    console.log('Loading patch from localStorage');
    // TODO store this object somewhere global. USE blank, ABOVE
    patch = {
      id: parseInt(localStorage.getItem('id')) || 0,
      name: parseInt(localStorage.getItem(_NAME)) || 'Blank',
      modules: JSON.parse(localStorage.getItem(_MODULES)) || [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
      connections: JSON.parse(localStorage.getItem(_CONNECTIONS)) || [],
      parameterSets: []
    };
    // patch = Object.assign({}, blank);
    // patch.id: parseInt(localStorage.getItem('id')),
    //   name: parseInt(localStorage.getItem(_NAME)),
    //   modules: JSON.parse(localStorage.getItem(_MODULES)),
    //   connections: JSON.parse(localStorage.getItem(_CONNECTIONS))
    // });

    // we WERE presupposing that there is state.patches...
    // will not work if not (ie. no firebase, etc).
    const p = JSON.parse(localStorage.getItem(_PARAMETERS));
    if (p) {
      patch.parameterSets.push({
        parameters: p // dont care about name: as they're prob not logged in & no <select> at all
      });
    }
  }

  // loads: id, name and modules ...
  commit('LOAD_PATCH', patch);

  // ensure nodes (+ inlets/outlets) are in the DOM
  Vue.nextTick(function() {
    console.log('All modules loaded, now routing audio...');
    // ... then load connections (from the same patch Object) ...
    commit('LOAD_CONNECTIONS', patch);

    // ... lastly, load parameters (from the same patch Object)
    commit('LOAD_PARAMETERS', patch);
  });
};

export const savePatch = ({ commit, state }, data) => {
  const key = state.patchKey;
  let patch = state.patches[key];   // make a copy of the current patch.. ///  by reference or by value here

  patch.id = state.id;
  patch.name = state.name;
  patch.modules = state.modules;
  patch.connections = state.connections;
  patch.parameterSets[state.parameterKey] = {
    name: data.paramName,
    parameters: state.parameters
  };

  // Update patch in Database
  api.save('patch/' + key, patch)
    .then(() => {
      console.log('saved');
    })
    .catch((err) => {
      console.log(err); // NOT SIGNED IN ?
    });

  // Update patch in localStorage
  commit('SAVE_PATCH', {
    key: state.patchKey,
    patch: patch
  });
};

export const addPatch = ({ commit, state }) => {
  const key = generateKey();
  // const blank = {
  //   id: 0,
  //   name: 'Blank',
  //   modules: [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
  //   connections: [],
  //   parameterSets: []
  // };

  state.patchKey = key;
  state.parameterKey = 0;

  commit('SAVE_PATCH', {
    key,
    patch: blank
  });
};

export const fetchPatches = ({ commit }) => {
  api.load('/patch')
    .then((patches) => {
      commit('SET_PATCHES', patches);

      // ALSO store in localStorage...?
      // localStorage.setItem(_PARAMETERS
    })
    .catch(() => {
      console.log('Not signed in.'); // NOT SIGNED IN ?
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
