import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

Vue.use(Vuex);

let id = 1;   // module id. Start at 1, as masterOut is 0.
let cid = 0;  // connector id

export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';


// Create an object to hold the initial state when the app starts up
const state = {
  activeModule: 0,
  activeConnection: 0,
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]'),
  connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]'),
  masterOutlet: {'x': 0, 'y': 0}
};


// Create an object storing various mutations. We will write the mutation
const mutations = {
  SET_ACTIVE_MODULE(state, id) {
    state.activeModule = id;
  },
  ADD_MODULE(state, type) {
    state.modules.push({
      id: id++,
      type: type,
      x: 0,
      y: 0
    });
  },
  REMOVE_MODULE(state, id) {
    state.modules = state.modules.filter((module) => {
      module.id !== id;
    });

    // state.modules.splice(state.modules.indexOf(id), 1);
  },
  UPDATE_POSITION(state, x, y) {
    const module = state.modules.find(function(module) { return module.id === state.activeModule; });
    module.x = x;
    module.y = y;
  },

  MASTER(state, x, y) {
    state.masterOutlet.x = x;
    state.masterOutlet.y = y;
  },

  SET_ACTIVE_CONNECTION(state, id) {
    state.activeConnection = id;
  },
  ADD_CONNECTION(state, outlet) {
    // const module = state.modules.find((m) => { m.id === state.activeModule; });
    const module = state.modules.find(function(m) { return m.id === state.activeModule; });
    const from = {
      module: module,        // for line (x,y) positioning
      // x: module.x,
      // y: module.y,
      port: outlet.port,     // to calculate where the line will connect
      label: outlet.label,   // for reference
      data: outlet.data      // for data flow
    };

    const to = {    // Object.seal({
      module: null,
      port: null,
      label: null,
      data: null
    };

    state.connections.push({
      id: cid++,
      to,
      from
    });
  },
  UPDATE_CONNECTION(state, to) {
    // const connection = state.connections.find((c) => { c.id === id; });  // WHY NOT WORK
    const connection = state.connections.find(function(c) { return c.id === state.activeConnection; });

    connection.to = to;
    connection.to.module = state.activeModule === 0
      ? state.masterOutlet
      : state.modules.find(function(m) { return m.id === state.activeModule; });
      // state.modules.find((m) => { m.id === state.activeModule; });


    // if (connection.to.module === connection.from.module) {
    //     // dispatch('REMOVE_CONNECTION');
    // }

    const source = connection.from.data;
    const destination = connection.to.data;

    if (source && destination) {
      console.log('connecting %s --> %s', connection.from.label, connection.to.label);
      source.connect(destination);
    }
  },
  REMOVE_CONNECTION(state) {
    let active = state.activeConnection;
    let connection = state.connections.find(c => { c.id === active; });
    state.connections.splice(state.modules.indexOf(connection), 1);
  },


  ROUTE_AUDIO(state, source, destination) {
    //
  }
};


// Combine the initial state and the mutations to create a Vuex store.
export default new Vuex.Store({
  state,
  mutations,
  plugins,
  strict: process.env.NODE_ENV !== 'production'
});
