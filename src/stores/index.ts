import { createPinia } from 'pinia';
// import Vue from 'vue';
// import Vuex from 'vuex';
// import app from './app';
// import patch from './patch';
// import plugins from './plugins';

// Vue.use(Vuex);

export function createStore(app) {
  // return new Vuex.Store({
  //   modules: {
  //     app,
  //     patch,
  //     // user,
  //     // audio: audio stuffs / nodes ?
  //   },
  //   plugins
  //   // strict: process.env.NODE_ENV !== 'production'
  // });
	const pinia = createPinia();
	app.use(pinia);
};

// export default createStore();
