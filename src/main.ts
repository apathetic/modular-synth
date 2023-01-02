import { createApp } from 'vue';
import App from './App.vue';
// import store from './stores';
// import router from './router';
// import CompositionAPI from '@vue/composition-api';
// import { auth } from './stores/firebase';
// import { context } from './audio';

import { createStore } from '@/stores';
import { registerComponents, registerServiceWorker } from '@/utils/register';

import '@/styles/styles.scss';


const app = createApp(App);

createStore(app);
registerComponents(app);
registerServiceWorker();

// const store = createStore();
// const router = createRouter();


// Extend the Vue proto with two props:
// Object.defineProperties(Vue.prototype, {
//   $bus: {
//     get() { return this.$root.bus; }
//   },
//   $authenticated: {
//     get() { return this.$root.authenticated; },
//     set(a) { this.$root.authenticated = a; }
//   }
// });


// TODO inject at a module level...?
// AudioContext Mixin: all Components will have access to AudioContext
// Vue.mixin({
//   data() {
//     return { context };
//   }
// });



app.mount('main');

/* new Vue({
  // router,
  // store,
  data: {
    // bus: new Vue(),
    authenticated: false
  },
  render: (h) => h(App),
  beforeCreate() {
    auth.onAuthStateChanged((user: any) => {
      this.$authenticated = !!user;

      if (this.$authenticated) {
        this.$store.dispatch('fetchPatches');
      }
    });
  }
}).$mount('main');
 */