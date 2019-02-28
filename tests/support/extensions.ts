import inlets from '@/components/system/Inlets.vue';
import outlets from '@/components/system/Outlets.vue';
// import store from 'src/store';
import { context } from '@/audio/';

export const extensions = {
  use: [{
    install: (Vue) => {
      Object.defineProperty(Vue.prototype, '$bus', {
        get() {
          return { // whatever mocked data
            $on: () => { /* empty */ },
            $off: () => { /* empty */ }
          };
        }
      });
      // Object.defineProperty(Vue.prototype, '$store', {
      //   get() {
      //     return store;
      //   }
      // });
    }
  }],

  mixin: [{
    data() {
      return { context };
    }
  }],

  components: {
    inlets,
    outlets
  }
};

