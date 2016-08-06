import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

Vue.use(Vuex);

let id = 0;

export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';


// Create an object to hold the initial state when the app starts up
const state = {
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]'),
  connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]')
};


// Create an object storing various mutations. We will write the mutation
const mutations = {
  ADD_MODULE(state, type) {
    // FYI vue wraps push, splice, pop, etc. to trigger vue's reactivity updates
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
      to: to,
      from: from
    });
  },
  REMOVE_CONNECTION(state, c) {
    state.connections.splice(state.connections.indexOf(c), 1);
  }
};


// Combine the initial state and the mutations to create a Vuex store.
export default new Vuex.Store({
  state,
  mutations,
  plugins,
  strict: process.env.NODE_ENV !== 'production'
});
