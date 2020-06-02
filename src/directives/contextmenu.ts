import { DirectiveOptions } from 'vue';


/**
 * Determine whether a click occurred outside the referenced
 * element(s) or not. Trigger the directive's handler if so.
 */
export default {
  name: 'contextmenu', // used when registering. Will become `v-contextmenu` in practice

  inserted(el) {
    el.focus();
  },

  bind(el, binding, vnode) {
    const s = JSON.stringify;
    // console.log(`
    //   argument: ${s(binding.arg)}
    //   vnode keys: ${Object.keys(vnode).join(', ')}
    // `);
  }
} as DirectiveOptions;
