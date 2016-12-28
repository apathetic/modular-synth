import Vue from 'vue';
import store from './store/store';
import App from './App';
import FileManager from './FileManager';

const context = window.AudioContext && (new window.AudioContext());
const bus = new Vue();

Object.defineProperty(Vue.prototype, '$bus', {
  get() {
    return this.$root.bus;
  }
});

// window.App = App;

// All Components will have access to AudioContext
// oh.. although *now*, that includes Connectors
Vue.mixin({
  data() {
    return {
      context: context
    };
  }
});



/* */
Vue.component('inlets', {
  functional: true,
  props: ['ports'],
  template: `
    <div v-once class="inlets">
      <span v-for="(inlet, index) in ports"
        :data-label="inlet.label"
        :data-port="index"
        class="inlet">
      </span>
    </div>
  `
});

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

//
// Vue.component('ports', {
//   functional: true,
//   props: ['data', 'type'],
//   template: `
//     <div v-once :class="(type == in) ? 'inlets' : 'outlets'">
//       <span v-for="(port, index) in ports"
//         :data-label="port.label"
//         :data-port="index"
//         :class="(type == in) ? 'inlet' : 'outlet'">">
//         // v-if out ... @mousedown.stop="newConnection(port)"
//       </span>
//     </div>
//   `
// });
/* */


/* eslint-disable no-new */
new Vue({
  store,
  // el: 'body',
  el: '#test',
  components: { App, FileManager },
  data: { bus }
});
