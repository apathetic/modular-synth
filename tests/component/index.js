
// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';

import { mount } from 'cypress/vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia'
import { context } from '@/audio';
import { createStore } from '@/stores';
import { useAppStore } from '@/stores/app';
import { registerComponents } from '@/utils/register';

import '@/styles/styles.scss';
import '../../src/styles/module.scss';


// declare global {
//   namespace Cypress {
//     interface Chainable {
//       mount(
//         component: any,
//         options?: Record<string, any>
//       ): Chainable<any>
//     }
//   }
// }


// https://github.com/filiphric/trelloapp-vue-vite-ts/blob/eggheadio/component-testing/cypress/support/component.ts
Cypress.Commands.add('mount', (component, options = {}) => {
  const pinia = createPinia();
  const store = useAppStore(pinia);

  Object.assign(store, options.store);

  return mount(component, {
    store,
    global: {
      plugins: [registerComponents, /* createStore */ ],
      stubs: { transition: false }
    },
    ...options
  });
});
