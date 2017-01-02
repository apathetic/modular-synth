import Vue from 'vue';
import store from './store';
import App from './App';
import FileManager from './FileManager';

const context = window.AudioContext && (new window.AudioContext());
const bus = new Vue();

// for midi events, drag events, and ....?  Setting/Clearing Focus/Active ...?
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

/* */

Vue.component('inlets', {
  functional: true,
  props: { ports: {} },

  // A)
  // template: '<div>{ { name }}</div>'

  // B)
  // render: inlets.render,
  // staticRenderFns: inlets.staticRenderFns


  // C)
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
  el: 'main',
  components: { App, FileManager },
  data: { bus }
});
