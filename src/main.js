import Vue from 'vue';
import store from './store';
import Synth from './Synth';
import PatchManager from './PatchManager.vue';
import ContextMenu from './components/UI/contextMenu';
import { mapActions } from 'vuex';
import { auth } from './store/firebase';
import { context } from './audio';


const bus = new Vue();
let authenticated = false;
Vue.config.productionTip = false;


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


// AudioContext Mixin
// All Components will have access to AudioContext
Vue.mixin({
  data() {
    return {
      context: context
    };
  }
});

/* * /
Vue.component('inlets', {
  functional: true,
  props: { ports: Array },
  template: `
    <div class="inlets">
      <span v-for="(inlet, index) in ports"
        :data-label="inlet.label"
        :data-port="index"
        class="inlet">
      </span>
    </div>
  `
});

/* * /

Vue.component('outlets', {
  functional: true,
  props: ['ports'],
  template: `
  <div v-once class="outlets">
    <span v-for="(outlet, index) in ports"
      @mousedown.stop="newConnection(outlet)"
      :data-label="outlet.label"
      :data-port="index"
      class="outlet">
    </span>
  </div>
  `
});

/* */

// TODO use the vue + compiler bundle for this: ...?
Vue.component('inlets', {
  functional: true,
  props: { ports: Array },
  render: function(createElement, context) {
    const ports = context.props.ports;

    return createElement('div',
      {
        class: { 'inlets': true }
      },
      ports.map((port, i) => {
        return createElement('span',
          {
            class: { 'inlet': true },
            attrs: {
              'data-label': port.label,
              'data-port': i
            }
          }
        );
      })
    );
  }
});
/**/

Vue.component('outlets', {
  functional: true,
  props: { ports: Array },
  render: function(createElement, context) {
    const ports = context.props.ports;

    return createElement('div',
      {
        class: { 'outlets': true }
      },
      ports.map((port, i) => {
        return createElement('span',
          {
            on: {
              mousedown: (e) => {
                e.stopPropagation();
                // store.commit('ADD_CONNECTION', i);  // just port #, as the module is already ref'd in "focused"
                bus.$emit('connection:start', i, context.parent.id);
              }
            },
            class: { 'outlet': true },
            attrs: {
              'data-label': port.label,
              'data-port': i
            }
          }
        );
      })
    );
  }
});


// Register a global custom directive called v-content-menu
Vue.directive('context-menu', {
  inserted: function(element) {

  }
});

/* eslint-disable no-new */
// const app = new Vue({
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

// if (window.Cypress) {
// window.app = app; // for testing
// }
