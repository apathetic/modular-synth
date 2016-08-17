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

Vue.partial('inlets', '<div class="inlets"><span v-for="inlet in inlets" data-label="{{ inlet.label }}" class="inlet"></span></div>');
Vue.partial('outlets', '<div class="outlets"><span v-for="outlet in outlets" @mousedown.stop="newConnection(outlet)" data-label="{{ outlet.label }}" class="outlet"></span></div>');


/* eslint-disable no-new */
new Vue({
  store,
  el: 'main',
  components: { App }
});
