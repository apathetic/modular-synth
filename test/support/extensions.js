import inlets from '@/components/functional/inlets';
import store from '@/store';
import Vuex from 'vuex';
import { context } from '@/audio';

export const extensions = {
  use: store,
  // use: Vuex,
  mixin: [{
    data() {
      return { context };
    }
  }],
  components: {
    inlets
  }
}

// const getRoot = () => cy.window().its('wes')
// const getStore = () => cy.window().its('app.$store')
// const getVCO = () => cy.get('.module')
