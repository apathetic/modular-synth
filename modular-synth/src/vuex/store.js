import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

Vue.use(Vuex);

let id = 0;   // module id
let cid = 0;  // connector id

export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';


// Create an object to hold the initial state when the app starts up
const state = {
  active: 0,
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]'),
  connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]')
};


// Create an object storing various mutations. We will write the mutation
const mutations = {
  SET_ACTIVE(state, id) {
    state.active = id;
  },
  ADD_MODULE(state, type) {
    state.modules.push({
      id: id++,
      type: type,
      x: 0,
      y: 0,
      dragging: false
    });
  },
  REMOVE_MODULE(state, id) {
    state.modules.splice(state.modules.indexOf(id), 1);

    // return state.modules.filter((module) => {
    //   module.id !== id;
    // });
  },
  UPDATE_POSITION(state, id, x, y) {
    state.modules[id].x = x;
    state.modules[id].y = y;
    // Vue.set(state.modules[id], 'x', x);
    // Vue.set(state.modules[id], 'y', y);
  },


  ADD_CONNECTION(state, to, from) {
    state.connections.push({
      id: cid++,
      to,
      from
    });
  },
  UPDATE_CONNECTION(state, id, to) {
    let active = state.active;
    let connection = state.connections.find((c) => { return c.id === id; });

    to.module = state.modules[active];
    connection.to = to;

    console.log('updating cnx', connection, to);

    // const connection = state.connections[id];
    // state.connections.splice(state.connections.indexOf(id), 1);
  },
  REMOVE_CONNECTION(state, id) {
    let connection = state.connections.find(c => { c.id === id; });
    state.connections.splice(state.modules.indexOf(connection), 1);
  }
};


// Combine the initial state and the mutations to create a Vuex store.
export default new Vuex.Store({
  state,
  mutations,
  plugins
  // strict: process.env.NODE_ENV !== 'production'
});
