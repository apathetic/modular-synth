import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

Vue.use(Vuex);

let id = 1;   // module id. Start at 1, as master-out is 0.
let cid = 0;  // connector id

export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';


// Create an object to hold the initial state when the app starts up
const state = {
  activeModule: 0,
  activeConnection: 0,
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]'),
  connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]')
};


// Create an object storing various mutations. We will write the mutation
const mutations = {
  SET_ACTIVE(state, id) {
    state.activeModule = id;
  },
  ADD_MODULE(state, type) {
    state.modules.push({
      id: id++,
      type: type,
      x: 0,
      y: 0
    });

    // id++;
    // state.modules[id] = {
    //   id: id,
    //   type: type,
    //   x: 0,
    //   y: 0
    //   // dragging: false
    // };
  },
  REMOVE_MODULE(state, id) {
    state.modules = state.modules.filter((module) => {
      module.id !== id;
    });

    // state.modules.splice(state.modules.indexOf(id), 1);
  },
  UPDATE_POSITION(state, id, x, y) {
    // state.modules[id].x = x;
    // state.modules[id].y = y;
    // Vue.set(state.modules[id], 'x', x);
    // Vue.set(state.modules[id], 'y', y);

    let active = state.activeModule;
    let module = state.modules.find((m) => { m.id === active; });

    module = state.modules.find(function(module) { return module.id === active; });
    module.x = x;
    module.y = y;
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
  UPDATE_CONNECTION(state, id, to) {
    // const connection = state.connections.find((c) => { c.id === id; });
    // const module = state.modules.find((m) => { m.id === state.activeModule; });
    const connection = state.connections.find(function(c) { return c.id === id; });
    const module = state.modules.find(function(m) { return m.id === state.activeModule; });

    to.module = module;
    connection.to = to;

    const source = connection.from.data;
    const destination = connection.to.data;

    console.log(source, destination);

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

  ROUTE_AUDIO(state, source, destination) {}
};


// Combine the initial state and the mutations to create a Vuex store.
export default new Vuex.Store({
  state,
  mutations,
  plugins,
  strict: process.env.NODE_ENV !== 'production'
});
