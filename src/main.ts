import Vue from 'vue';
import App from './App.vue';
import store from './store';
// import router from './router';
import CompositionAPI from '@vue/composition-api';
import { auth } from './store/firebase';
import { context } from './audio';

import { registerComponents, registerServiceWorker } from '@/utils/register';


Vue.config.productionTip = false;
Vue.use(CompositionAPI);


registerComponents();
registerServiceWorker();

// const store = createStore();
// const router = createRouter();


// Extend the Vue proto with two props:
Object.defineProperties(Vue.prototype, {
  $bus: {
    get() { return this.$root.bus; }
  },
  $authenticated: {
    get() { return this.$root.authenticated; },
    set(a) { this.$root.authenticated = a; }
  }
});


// TODO inject at a module level...?
// AudioContext Mixin: all Components will have access to AudioContext
Vue.mixin({
  data() {
    return { context };
  }
});



new Vue({
  // router,
  store,
  data: {
    bus: new Vue(),
    authenticated: false
  },
  render: (h) => h(App),
  beforeCreate() {
    auth.onAuthStateChanged((user: any) => {
      this.$authenticated = !!user;

      if (this.$authenticated) {
        this.$store.dispatch('app/fetchPatches');
      }
    });
  }
}).$mount('main');
