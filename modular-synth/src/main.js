import Vue from 'vue';
import App from './App';

var context = window.AudioContext && (new window.AudioContext());
// var masterOut = context.createGain();
// masterOut.connect(context.destination);

// All Components will have access to AudioContext
Vue.mixin({
  data: function() {
    return {
      context: context
    };
  }
});

/* * /
// Create Audio Input mixin
// CREATE MIXIN from Node.vue?  AudioInput / ControlInputs / ...
var inputs = {
  methods: {
    addInput: function() {
      console.log('hello from mixin!');
    }
  }
};
console.log(inputs);
// var Component = Vue.extend({
//   mixins: [inputs, outputs,...]
// })
/* */


/* eslint-disable no-new */
new Vue({
  el: 'main',
  components: { App }
});
