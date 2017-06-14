import Vue from 'vue';
import { api } from './firebase';
// import { parameterSets } from './getters';
import { NAME_KEY, MODULES_KEY, CONNECTIONS_KEY } from './index';


// -----------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

// THIS is important: we cannot load modules, connections, parameters
// all at once. Modules must be mounted _first_, so that the AudioNode
// is a available to the Connections; likewise with the Modules'
// settings being availble to the Parameters.
export const loadPatch = ({ commit, state }, key) => {
  let patch;

  console.log('-----------------------------');

  // if loading patch via a specific key
  if (key && state.patches[key]) {
    console.log('Loading patch: ', key);
    patch = state.patches[key];
    commit('SET_KEY', key);
  } else {
    console.log('Loading patch from localStorage');
    patch = {
      id: parseInt(localStorage.getItem('id')) || 0,
      name: parseInt(localStorage.getItem(NAME_KEY)) || 'Hello World',
      modules: JSON.parse(localStorage.getItem(MODULES_KEY)) || [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
      connections: JSON.parse(localStorage.getItem(CONNECTIONS_KEY)) || []
    };
  }

  commit('LOAD_PATCH', patch);

  // ensure nodes (+ inlets/outlets) are in the DOM
  Vue.nextTick(function() {
    console.log('All modules loaded, now routing audio...');
    commit('LOAD_CONNECTIONS', patch);    // connections);
    commit('LOAD_PARAMETERS');
  });
};

export const savePatch = ({ state }) => {
  // const key = generateKey(state.patches name);
  const key = state.patchKey;

  // const parameterSets = ..... whatever [];
  //
  // parameterSets[currentParamsSet].parameters = state.parameters;

  const patch = {
    id: state.id,
    name: state.name,
    modules: state.modules,
    connections: state.connections,
    parameterSets: []       // gaaah. Save all parameterSets... or just current?
  };

  api.save('patch/' + key, patch)
    .then(() => {
      console.log('saved');
    })
    .catch((err) => {
      console.log(err); // NOT SIGNED IN ?
    });
};

export const fetchPatches = ({ commit }) => {
  api.load('/patch')
    .then((patches) => {
      console.log(patches);
      commit('SET_PATCHES', patches);
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
