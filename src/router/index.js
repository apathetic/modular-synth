import Vue from 'vue';
import Router from 'vue-router';
const SynthView = () => import('Synth.vue');
const logoutView = () => import('Synth.vue');

Vue.use(Router);

export function createRouter() {
  return new Router({
    mode: 'history',
    // scrollBehavior: () => ({y: 0}),
    routes: [
      { path: '',        name:'synth', component: SynthView },
      { path: '/logout', name:'logout', component: logoutView }
    ]
  });
}

export default createRouter();
