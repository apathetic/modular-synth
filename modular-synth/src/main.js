import Vue from 'vue';
import store from './vuex/store';
import App from './App';


var context = window.AudioContext && (new window.AudioContext());
// var masterOut = context.createGain();
// masterOut.connect(context.destination);

// All Components will have access to AudioContext
// oh.. although *now*, that includes Connectors
Vue.mixin({
  data() {
    return {
      context: context
    };
  }
  // ready() {
  //   this.$on... dispatch(setACTIVE)
  // }
});

/* eslint-disable no-new */
new Vue({
  store,
  el: 'main',
  components: { App }
});
