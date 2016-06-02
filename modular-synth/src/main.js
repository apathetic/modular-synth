import Vue from 'vue';
import App from './App';

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { App }
});


var context = window.AudioContext && (new window.AudioContext());
var masterOut = context.createGain();
masterOut.connect(context.destination);

// All Components have access to Audio patch stuffs
Vue.mixin({
  data: function() {
    this.$data.context = context;
    this.$data.masterOut = masterOut;
  },
  created: function() {
    this.$data.context = context;
    this.$data.masterOut = masterOut;
    // var context = this.$options.context;
    // var masterOut = this.$options.masterOut;

    // this.context = context;
    // this.masterOut = masterOut;
    this.hello();
  },
  methods: {
    hello: function() {
      console.log('hello from mixin!');
    }
  }
});


// define a component that uses this mixin
// var Component = Vue.extend({
//   mixins: [patch]
// })
