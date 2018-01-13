import { VueConstructor } from 'vue/types/vue';

declare module 'vue/types/vue' {
  interface Vue {
    $bus: VueConstructor,
    $authenticated: boolean
  }
}

// Object.defineProperty(Vue.prototype, '$bus', {
//   get() {
//     return this.$root.bus;
//   }
// });

// Object.defineProperty(Vue.prototype, '$authenticated', {
//   get() {
//     return this.$root.authenticated;
//   }
// });
