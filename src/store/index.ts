import Vue from 'vue';
import Vuex from 'vuex';
import appModule from './app/';
import patchModule from './patch/';
import plugins from './plugins';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    app: appModule,
    patch: patchModule
  },
  plugins
  // strict: process.env.NODE_ENV !== 'production'
});
