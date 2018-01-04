import Vue from 'vue';
// import Vuex from 'vuex';
import store from './store';
import Synth from './Synth';
import PatchManager from './PatchManager.vue';
import ContextMenu from './components/UI/contextMenu';
import inlets from './components/functional/inlets';
import outlets from './components/functional/outlets';
import { mapActions } from 'vuex';
import { auth } from './store/firebase';
import { context } from './audio';


Vue.config.productionTip = false;


const bus = new Vue();
let authenticated = false;


// Global Event Bus
Object.defineProperty(Vue.prototype, '$bus', {
  get() {
    return this.$root.bus;
  }
});


// Global isAuthenticated variable
Object.defineProperty(Vue.prototype, '$authenticated', {
  get() {
    return this.$root.authenticated;
  }
});


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

/* eslint-disable no-new */
new Vue({
  store,
  el: 'main',
  components: { Synth, PatchManager, ContextMenu },
  data: { bus, authenticated },
  methods: {
    ...mapActions([
      'fetchPatches'
    ])
  },
  beforeCreate: function() {
    auth.onAuthStateChanged((user) => {
      this.authenticated = !!user;

      if (this.authenticated) {
        this.fetchPatches();
      }
    });
  }
});
