import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';
// import * as getters from './getters';

Vue.use(Vuex);


export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  id: localStorage.getItem('id') || 1,    // module id. Start at 1, as masterOut is 0.
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[{"type": "MasterOut", "id": 0, "x": 0, "y": 0}]'),
  connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]'),
  editing: false,
  selected: undefined,  // Hovered: Module Info, Connections.
  active: 0             // Clicked: Dragging, Deleting.
};


// -----------------------------------------------
//  MUTATIONS
// -----------------------------------------------

const mutations = {
  LOAD(state, newState) {
    if (newState) {
      for (let key in newState) {
        state[key] = newState[key];
      }
    }
  },

  TOGGLE_EDIT(state) {
    state.editing = !state.editing;
  },

  SET_ACTIVE(state, id) {
    state.active = id;
  },
  CLEAR_ACTIVE(state) {
    state.active = undefined;
  },
  SET_FOCUS(state, id) {
    state.selected = id;
  },
  CLEAR_FOCUS(state) {
    state.selected = undefined;
  },

  ADD_MODULE(state, type) {
    console.log('adding new module %s id %d', type, state.id);
    state.modules.push({
      id: state.id,
      type: type,
      x: 0,         // for dragging X
      y: 0,         // for dragging Y
      col: 0,       // for grid X position
      row: 0        // for grid Y position
    });

    state.id++;
  },
  REMOVE_MODULE(state) {
    const id = state.active;

    // filter it out. (WHY NO WORK)
    // state.modules = state.modules.filter((module) => {
    //   module.id !== id;
    // });

    state.modules.some((module, i) => {
      if (module.id === id) {
        state.modules.splice(i, 1);
        return true;
      }
    });

    console.log('removing module #', id);

    state.connections.forEach((connection) => {
      if (connection.to.module.id === id || connection.from.module.id === id) {
      }
    });
  },

  UPDATE_GRID_POSITION(state, id, x, y) {
    const module = state.modules.find(function(module) { return module.id === id; });

    module.x = x;
    module.y = y;
  },
  UPDATE_RACK_POSITION(state, id, col, row) {
    const module = state.modules.find(function(module) { return module.id === id; });

    module.col = col;
    module.row = row;
  },

  // 'start_connection' ?
  ADD_CONNECTION(state, port) {
    // find the module that contains the outlet. Ironically, we dont even use "outlet" to
    // determine this, instead relying on the "selected" module in the App.

    const from = {
      id: state.selected,   // TODO ?
      port: port
    };

    const to = {
      id: undefined,
      port: undefined
    };

    state.connections.push({
      id: parseInt(state.id),
      to,
      from
    });

    state.id++;
  },
  UPDATE_CONNECTION(state, id, port) {
    const connection = state.connections.find(function(c) { return c.id === id; });
    // const module = state.modules.find(function(m) { return m.id === state.selected; });

    const to = {
      id: state.selected,   // TODO ?
      port: port            // to calculate the line y-offset and determine which audio outlet to connect to
    };

    connection.to = to;
  },
  REMOVE_CONNECTION(state, id) {
    // let active = state.activeConnection;
    const connection = state.connections.find(c => { return c.id === id; });

    if (connection) {
      state.connections.splice(state.modules.indexOf(connection), 1);
    }
  }
};


// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

const getters = {
  editing: (state) => state.editing,
  active: (state) => state.modules.find(function(module) { return module.id === state.active; }),
  modules: (state) => state.modules,
  connectors: (state) => state.connections,
  selected: (state) => state.selected
};


// -----------------------------------------------
//  STORE
// -----------------------------------------------

export default new Vuex.Store({
  state,
  getters,
  mutations,
  plugins
  // strict: process.env.NODE_ENV !== 'production'
});
