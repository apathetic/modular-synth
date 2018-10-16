import { configure } from '@storybook/vue';

import Vue from 'vue';
import Vuex from 'vuex'; // Vue plugins

// const req = require.context('../src/stories', true, /.stories.ts$/);

// Import your custom components.
import VCO from '../src/components/VCO.vue';

// Install Vue plugins.
Vue.use(Vuex);

// Register custom components.
Vue.component('VCO', VCO);

function loadStories() {
  // You can require as many stories as you need.
  require('../src/stories/index.stories.js');
  // req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);

