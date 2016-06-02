import Vue from 'vue';
import App from './App';

var context = window.AudioContext && (new window.AudioContext());
var masterOut = context.createGain();

masterOut.connect(context.destination);

Vue.mixin({
  data: function() {
    // All Components will have access to AudioContext
    return {
      context: context
      // masterOut: masterOut
    };
  }
});



/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { App }
});
