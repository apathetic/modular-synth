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

/* eslint-disable no-new */
new Vue({
  el: 'main',
  components: { App }
});
