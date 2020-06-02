import { configure } from '@storybook/vue';
import { context } from '@/audio';

import Vue from 'vue';
import Vuex from 'vuex'; // Vue plugins
import Inlets from '@/components/system/Inlets.vue';
import Outlets from '@/components/system/Outlets.vue';

// styles
import '@/styles/styles.scss';
import '@/styles/module.scss';


// Import your custom components.
import OSC from '@/components/audio/OSC';

// Install Vue plugins n' mixins
Vue.use(Vuex);
Vue.mixin({
  data() {
    return { context };
  }
});


// Register custom components.
// Global Components (inlets / outlets)
Vue.component('inlets', Inlets);
Vue.component('outlets', Outlets);

// Vue.component('Module', Module);
Vue.component('OSC', OSC);

// const req = require.context('../src/stories', true, /.stories.ts$/);

function loadStories() {
  // You can require as many stories as you need.
  require('../src/stories/OSC.js');
  // req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);

