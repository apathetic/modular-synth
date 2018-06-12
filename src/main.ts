import Vue from 'vue';
import store from './store/';
import Synth from './Synth.vue';
import PatchManager from './components/system/PatchManager.vue';
import inlets from './components/system/Inlets.vue';
import outlets from './components/system/Outlets.vue';
import ContextMenu from './components/UI/ContextMenu.vue';
import './registerServiceWorker';

// import { mapActions } from 'vuex';
// import { mapActions } from 'vuex/types/helpers';
// import { fetchPatches } from "./store/actions";


import { auth } from './store/firebase';
import { context } from './audio';


Vue.config.productionTip = false;


const bus = new Vue();
const authenticated = false;


// Extend the Vue proto with two props:
Object.defineProperties(Vue.prototype, {
  $bus: {
    get() { return this.$root.bus; }
  },
  $authenticated: {
    get() { return this.$root.authenticated; },
    set(auth) { this.$root.authenticated = auth; }
  }
});


// TODO inject at a module level
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
// TODO:
Vue.directive('context-menu', {
  inserted(element) {
    console.log(element, 'contxt');
  }
});



new Vue({
  store,
  el: 'main',
  components: { Synth, PatchManager, ContextMenu },
  data: { bus, authenticated },
  beforeCreate() {
    auth.onAuthStateChanged((user: any) => {
      this.$authenticated = !!user;

      if (this.$authenticated) {
        debugger;
        this.$store.dispatch('fetchPatches');
      }
    });
  }
});
