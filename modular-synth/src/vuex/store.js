import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

// Make vue aware of Vuex
Vue.use(Vuex);

var id = 0;

export const STORAGE_KEY = 'wes';

// Create an object to hold the initial state when the app starts up
const state = {
  // TODO: Set up our initial state
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
};


// Create an object storing various mutations. We will write the mutation
const mutations = {
  NEW_MODULE(state, type) {
    // [TODO] use v-ref instead of idX
    // var N = Vue.extend({
    //   // props: {'type': type, idx: idx++},
    //   data: () => ({'type': type, 'idx': idx++})
    // });

    state.modules.push({
      type: type,
      id: id++
    });
  }
};


// Combine the initial state and the mutations to create a Vuex store.
// This store can be linked to our app.
export default new Vuex.Store({
  state,
  mutations,
  plugins
});
