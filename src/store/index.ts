import Vue from 'vue';
import Vuex from 'vuex';
import appState from './app/';
import patchState from './patch/';
import plugins from './plugins';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app: appState,
    patch: patchState
  },
  plugins
  // strict: process.env.NODE_ENV !== 'production'
});
