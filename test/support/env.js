import Vue from 'vue';
import store from '@/store';
import { context } from '@/audio';

// const bus = new Vue();

Vue.mixin({
  data() {
    return {
      context: context
    };
  }
});

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


// Creates a Vue environment with the correct Audio
// mixins, bus, etc ...
export const VueTest = new Vue({
  store,
  // el: 'main', // don't mount ... just yet...
  // data: { bus }
});

