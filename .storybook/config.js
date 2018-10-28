import { configure } from '@storybook/vue';
import { context } from '@/audio';

import Vue from 'vue';
import Vuex from 'vuex'; // Vue plugins
import inlets from '@/components/system/Inlets.vue';
import outlets from '@/components/system/Outlets.vue';


// styles
import '@/styles/styles.scss';


// Import your custom components.
import VCO from '../src/components/VCO.vue';

// Install Vue plugins n' mixins
Vue.use(Vuex);
Vue.mixin({
  data() {
    return { context };
  }
});


// Register custom components.
// Global Components (inlets / outlets)
Vue.component('inlets', inlets);
Vue.component('outlets', outlets);
Vue.component('VCO', VCO);

// const req = require.context('../src/stories', true, /.stories.ts$/);

function loadStories() {
  // You can require as many stories as you need.
  require('../src/stories/index.js');
  // req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);

