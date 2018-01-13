import Vue from 'vue';
// import Vuex from 'vuex';
import store from './store';
import Synth from './Synth.vue';
import PatchManager from './PatchManager.vue';
import ContextMenu from './components/UI/contextMenu.vue';
// import inlets from "./components/functional/inlets.js";
// import outlets from './components/functional/outlets.js';
import inlets from "./components/system/inlets.vue";
import outlets from './components/system/outlets.vue';

// import { mapActions } from 'vuex';
import { mapActions } from 'vuex/types/helpers';
import { fetchPatches } from "./store/actions";

import { auth } from './store/firebase';
import { context } from './audio';

import { Action } from 'vuex/types';
import { VueConstructor } from 'vue/types/vue';

Vue.config.productionTip = false;


const bus = new Vue();
let authenticated = false;

// ** MOVED to main.d.ts: 
// Global Event Bus
// Object.defineProperty(Vue.prototype, '$bus', {
//   get() {
//     return this.$root.bus;
//   }
// });

// // Global isAuthenticated variable
// Object.defineProperty(Vue.prototype, '$authenticated', {
//   get() {
//     return this.$root.authenticated;
//   }
// });


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
Vue.directive('context-menu', {
  inserted: function(element) {

  }
});


new Vue({
  store,
  el: "main",
  components: { Synth, PatchManager, ContextMenu },
  data: { bus, authenticated },
  methods: {
    fetchPatches
  },

  @Action('fetchPatches')fetchPatches;

  beforeCreate: function() {
    auth.onAuthStateChanged((user: any) => {
      this.$authenticated = !!user;

      if (this.$authenticated) {
        this.fetchPatches();
      }
    });
  }
});
