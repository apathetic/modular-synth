import inlets from '@/components/system/Inlets.vue';
import outlets from '@/components/system/Outlets.vue';

import * as UI from '@/components/UI';
import * as directives from '@/directives';


/**
 * Registers all base Vue Components/directives. Anything added to this root Vue
 * instance will be available everywhere as part of the universal bundle.
 */
export function registerComponents(app) {

  // System
  app.component('Inlets', inlets);
  app.component('Outlets', outlets);

  // UI
  for (const key in UI) {
    const component = UI[key];
    // Vue.component(component.name, component);
    app.component(key, component);
  }

  // Directives
  for (const key in directives) {
    const directive = directives[key];
    // Vue.directive(directive.name, directive);
    app.directive(directive.name, directive);
  }
}


/**
 * Registers ye olde service worker
 */
export function registerServiceWorker() {
  // if (process.env.NODE_ENV === 'production') {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
      });
    }
  // }
}
