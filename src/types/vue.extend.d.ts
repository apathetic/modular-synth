import { VueConstructor } from 'vue/types/vue';

declare module 'vue/types/vue' {
  interface Vue {
    $bus: VueConstructor;
    $authenticated: boolean;
  }
}
