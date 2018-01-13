import Vue from 'vue';
// import Vuex from 'vuex';
import store from './store';
import Synth from './Synth.vue';
import PatchManager from './PatchManager.vue';
import ContextMenu from './components/UI/contextMenu.vue';
import inlets from "./components/system/inlets.vue";
import outlets from './components/system/outlets.vue';

// import { mapActions } from 'vuex';
import { mapActions } from 'vuex/types/helpers';
// import { fetchPatches } from "./store/actions";
// import { Action } from 'vuex/types';

import { auth } from './store/firebase';
import { context } from './audio';

import { VueConstructor } from 'vue/types/vue';

Vue.config.productionTip = false;


const bus = new Vue();
let authenticated = false;


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
// Vue.directive('context-menu', {
//   inserted: function(element) {

//   }
// });


new Vue({
  store,
  el: "main",
  components: { Synth, PatchManager, ContextMenu },
  data: { bus, authenticated },
  beforeCreate: function() {
    auth.onAuthStateChanged((user: any) => {
      this.$authenticated = !!user;

      if (this.$authenticated) {
        this.$store.dispatch('fetchPatches');
      }
    });
  }
});
