import Vue from 'vue';
import Synth from './Synth.vue';
import { createStore } from './store';
// import { createRouter } from './router';
import CompositionAPI from '@vue/composition-api';
import inlets from './components/system/Inlets.vue';
import outlets from './components/system/Outlets.vue';
import { auth } from './store/firebase';
import { context } from './audio';
import './registerServiceWorker';

import contextmenu from '@/plugins/contextmenu.ts';


Vue.config.productionTip = false;
Vue.use(CompositionAPI);
Vue.directive('contextmenu', contextmenu);

const store = createStore();
// const router = createRouter();


// Extend the Vue proto with two props:
Object.defineProperties(Vue.prototype, {
  $bus: {
    get() { return this.$root.bus; }
  },
  $authenticated: {
    get() { return this.$root.authenticated; },
    set(a) { this.$root.authenticated = a; }
  }
});


// TODO inject at a module level...?
// AudioContext Mixin: all Components will have access to AudioContext
Vue.mixin({
  data() {
    return { context };
  }
});


// Global Components (inlets / outlets)
Vue.component('inlets', inlets);
Vue.component('outlets', outlets);


new Vue({
  // router,
  store,
  data: {
    bus: new Vue(),
    authenticated: false
  },
  render: (h) => h(Synth),
  beforeCreate() {
    auth.onAuthStateChanged((user: any) => {
      this.$authenticated = !!user;

      if (this.$authenticated) {
        this.$store.dispatch('fetchPatches');
      }
    });
  }
}).$mount('main');
