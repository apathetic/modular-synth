import Vue from 'vue';
import store from './store';
import Synth from './Synth.vue';
import inlets from './components/system/Inlets.vue';
import outlets from './components/system/Outlets.vue';
import './registerServiceWorker';
import { auth } from './store/firebase';
import { context } from './audio';


Vue.config.productionTip = false;



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


// Register a global custom directive called v-context-menu
// TODO: move to synth.vue ?
// https://github.com/vuejs/vue/issues/6385
// Vue.directive('context-menu', {
//   const state = new WeakMap()
//   inserted() {
//     console.log('inserted');
//   },
//   bind(el, binding, vnode) {
//     //
//   }
// });


new Vue({
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
