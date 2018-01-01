import inlets from '@/components/functional/inlets';
import outlets from '@/components/functional/outlets';
import store from '@/store';
import Vuex from 'vuex';
import { context } from '@/audio';

export const extensions = {
  use: [{
    install: function(Vue) {
      Object.defineProperty(Vue.prototype, '$bus', {
        get() {
          return { // whatever mocked data
            $on: function() {},
            $off: function() {}
          }
        }
      });
      Object.defineProperty(Vue.prototype, '$store', {
        get() {
          return store
        }
      });
    }
  }],

  mixin: [{
    data() {
      return { context };
    }
  }],

  components: {
    inlets,
    outlets
  }
}

// const getRoot = () => cy.window().its('wes')
// const getStore = () => cy.window().its('app.$store')
// const getVCO = () => cy.get('.module')
