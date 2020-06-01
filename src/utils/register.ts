import Vue, { Component, ComponentOptions, VNodeDirective, DirectiveOptions } from 'vue';
import { register } from 'register-service-worker';
import inlets from '@/components/system/Inlets.vue';
import outlets from '@/components/system/Outlets.vue';

import * as UI from '@/components/UI';
import * as directives from '@/directives';


/**
 * Registers all base Vue Components/directives. Anything added to this root Vue
 * instance will be available everywhere as part of the universal bundle.
 */
export function registerComponents() {

  // System
  Vue.component('Inlets', inlets);
  Vue.component('Outlets', outlets);

  // UI
  for (const key in UI) {
    const component = UI[key];
    // Vue.component(component.name, component);
    Vue.component(key, component);
  }

  // Directives
  for (const key in directives) {
    const directive = directives[key];
    Vue.directive(directive.name, directive);
  }
}


/**
 * Registers ye olde service worker
 */
export function registerServiceWorker() {
  if (process.env.NODE_ENV === 'production') {
    /* tslint:disable:no-console */
    register(`${process.env.BASE_URL}service-worker.js`, {
      ready() {
        console.log(
          'App is being served from cache by a service worker.\n' +
          'For more details, visit https://goo.gl/AFskqB',
        );
      },
      cached() {
        console.log('Content has been cached for offline use.');
      },
      updated() {
        console.log('New content is available; please refresh.');
      },
      offline() {
        console.log('No internet connection found. App is running in offline mode.');
      },
      error(error) {
        console.error('Error during service worker registration:', error);
      },
    });
  }
}
