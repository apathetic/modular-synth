/**
 * Determine whether a click occurred outside the referenced
 * element(s) or not. Trigger the directive's handler if so.
 */
export default {
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
};
