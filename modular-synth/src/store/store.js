import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

Vue.use(Vuex);


export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';

/**
 * Reactify the connections.
 * The connection objects stored in localStorage are just objects in JSON -- they
 * lack the reactvity that we get when adding actual modules with bound listeners
 * to the store; hence, we need to update all the static references.
 * @return {[type]} [description]
 */
function bindConnections() {
  const connections = state.connections;
  const modules = state.modules;

  console.log('load');

  for (let connection of connections) {
    const fromId = connection.from.module.id;
    connection.from.module = modules.find(function(m) { return m.id === fromId; });

    const toId = connection.to.module.id;
    connection.to.module = modules.find(function(m) { return m.id === toId; });

    // well... if the module has yet to init, its inputs/outputs will not exist
    // routeAudio(connection);
  }
};

/**
 * Route all Audio connections post-load.
 * @param  {[type]} connection [description]
 * @return {void}
 */
function routeAudio(connection) {
  const source = connection.from.data;
  const destination = connection.to.data;

  debugger;

  if (source && destination) {
    console.log('connecting %s --> %s', connection.from.label, connection.to.label);
    source.connect(destination);
  }
}


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  id: localStorage.getItem('id') || 1,    // module id. Start at 1, as masterOut is 0.
  // cid: localStorage.getItem('cid') || 0,  // connector id
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[{"type": "MasterOut", "id": 0, "x": 0, "y": 0}]'),
  connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]'),
  selected: null,   // Hovered: Module Info, Connections.
  active: 0,        // Clicked: Dragging, Deleting.
  // activeConnection: 0,
  editing: false
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
    bindConnections();
    // routeAudio();
  },

  TOGGLE_EDIT(state) {
    state.editing = !state.editing;
  },

  SET_ACTIVE(state, id) {
    state.active = id;
  },
  CLEAR_ACTIVE(state) {
    state.active = null;
  },
  SET_FOCUS(state, id) {
    state.selected = id;
  },
  CLEAR_FOCUS(state) {
    state.selected = null;
  },

  ADD_MODULE(state, type) {
    state.modules.push({
      id: state.id,
      type: type,
      x: 0,         // for dragging X
      y: 0,         // for dragging Y
      col: 0,       // for grid X position
      row: 0        // for grid Y position
    });

    // While it could be easier to reference a specific node, having a
    // sparse array creates "null"s, which are then problematic to iterate over.

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

    state.connections.forEach((connection) => {
      if (connection.to.module.id === id || connection.from.module.id === id) {
        console.log('removing ', connection);
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

  ADD_CONNECTION(state, outlet) {
    // const module = state.modules.find((m) => { m.id === state.activeModule; });
    const module = state.modules.find(function(m) { return m.id === state.selected; });
    // console.log(outlet);
    // const module = App.$children.find(function(m) { return m.$el.contains(outlet.port); });

    const from = {
      module: module,        // for line (x,y) positioning
      // x: module.x,
      // y: module.y,
      port: outlet.port,     // to calculate where the line will connect
      label: outlet.label,   // for reference
      data: outlet.data      // for data flow
    };


    // ACTUAL:
    // "from":{
    //   "port":0,
    //   "label":"output-1",
    //   "data":{},
    //   "module":{
    //     "id":1,"type":"Node","x":100,"y":237
    //   }

    // BETTER:
    // "from":{
    //   "port":0,
    //   "label":"output-1",
    //   "x":100,
    //   "y":237
    //   "moduleId":1,
    // }



    const to = {
      module: null,
      port: null,
      label: null,
      data: null
    };

    state.connections.push({
      id: parseInt(state.id),
      to,
      from
    });
    state.id++;
  },
  UPDATE_CONNECTION(state, id, inlet) {
    const connection = state.connections.find(function(c) { return c.id === id; });
    const module = state.modules.find(function(m) { return m.id === state.selected; });
    // const module = state.modules.find(function(m) { return m.id === state.active; });

    connection.to = inlet;
    connection.to.module = module;


    if (connection.to.module === connection.from.module) {
      // this.$store.dispatch('REMOVE_CONNECTION', id);
    } else {
      routeAudio(connection);
    }
  },
  REMOVE_CONNECTION(state, id) {
    // let active = state.activeConnection;
    let connection = state.connections.find(c => { c.id === id; });
    state.connections.splice(state.modules.indexOf(connection), 1);
  },

  ROUTE_AUDIO(state, source, destination) {
    //
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
