import inlets from '@/components/synth/Inlets.vue';
import outlets from '@/components/synth/Outlets.vue';
import * as UI from '@/components/UI';
// import * as directives from '@/directives';
import type { App } from 'vue';


// import type { Component, Directive } from 'vue';
// type xxx = Promise<Record<string, Component>>;
// type yyy = Promise<Record<string, Directive>>;




/**
 * Registers all base Vue Components/directives. Anything added to this root Vue
 * instance will be available everywhere as part of the universal bundle.
 */
export function registerComponents(app: App) {

  // System
  app.component('Inlets', inlets);
  app.component('Outlets', outlets);

  // UI
  Object.entries(UI).forEach(([key, component]) => {
    app.component(key, component);
  });

  // Directives
  // for (const key in directives) {
  //   const directive = directives[key as keyof typeof directives];
  //   app.directive(directive.name, directive);
  // }

  // Object.values(directives).forEach((directive: any) => {
  //   app.directive(directive.name, directive);
  // });
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
