import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

Vue.use(Vuex);


export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';



/**
 * Route an Audio connection.
 * @param  {Connector} connection Contains references to both source and destination audio nodes.
 * @return {void}
 */
function connect(connection) {
  const source = connection.from.data;
  const destination = connection.to.data;

  // const module = App.$children.find(function(m) { return m.$el.contains(outlet.port); });

  // const App = this.$parent;
  // const module = App.$children.find(function(m) { return m.id === connection.from.id; });
  // console.log(module);
  // debugger;

  if (source && destination) {
    console.log('connecting %s --> %s', connection.from.label, connection.to.label);
    // source.connect(destination);
  }
}

/**
 * Disconnect and Audio connection.
 * @param  {Connector} connection Contains references to both source and destination audio nodes.
 * @return {void}
 */
function disconnect(connection) {

}


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  id: localStorage.getItem('id') || 1,    // module id. Start at 1, as masterOut is 0.
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[{"type": "MasterOut", "id": 0, "x": 0, "y": 0}]'),
  connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]'),
  selected: null,   // Hovered: Module Info, Connections.
  active: 0,        // Clicked: Dragging, Deleting.
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
    // bindConnections();
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
    console.log('adding new module %s id %d', type, state.id);
    state.modules.push({
      id: state.id,
      type: type,
      x: 0,         // for dragging X
      y: 0,         // for dragging Y
      col: 0,       // for grid X position
      row: 0        // for grid Y position
    });

    // While it could be easier to reference a specific node, having a
    // sparse array creates "null"s, which are then problematic to iterate over (in the template).

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

  ADD_CONNECTION(state, outlet) {
    const module = state.modules.find(function(m) { return m.id === state.selected; });
    // const module = App.$children.find(function(m) { return m.$el.contains(outlet.port); });
    // console.log(outlet);

    // NOTE: outlet is a reference to the Component itself (ie in the App), NOT the state.module

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
    //   "moduleId": 1,
    //   "port": 0,
    //   "label": "output-1",
    //   "x": 100,
    //   "y": 237
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
      connect(connection);
    }
  },
  REMOVE_CONNECTION(state, id) {
    // let active = state.activeConnection;
    const connection = state.connections.find(c => { c.id === id; });
    if (connection) {
      state.connections.splice(state.modules.indexOf(connection), 1);
      disconnect(connection);
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
