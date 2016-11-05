import Vue from 'vue';
import store from './store/store';
import App from './App';
import FileManager from './FileManager';

const context = window.AudioContext && (new window.AudioContext());

// All Components will have access to AudioContext
// oh.. although *now*, that includes Connectors
Vue.mixin({
  data() {
    return {
      context: context
    };
  }
});

Vue.partial('inlets', '<div class="inlets"><span v-for="inlet in inlets" data-label="{{ inlet.label }}" class="inlet"></span></div>');
Vue.partial('outlets', '<div class="outlets"><span v-for="outlet in outlets" @mousedown.stop="newConnection(outlet)" data-label="{{ outlet.label }}" class="outlet"></span></div>');


/* eslint-disable no-new */
new Vue({
  store,
  el: 'body',
  components: { App, FileManager }
});


// window.App = App;
