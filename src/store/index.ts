import Vue from 'vue';
import Vuex from 'vuex';
import appState from './app/';
import patchState from './patch/';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app: appState,
    patch: patchState
  }
});
