import Delay from '@/components/Delay.vue';
import mountVue from 'cypress-vue-unit-test';
import { extensions } from '../../support/extensions';
import { Utils, Dummy } from '../../support/utils';

let delay;

describe('delay.vue', () => {
  beforeEach(
    mountVue(Delay, {
      vue: 'https://unpkg.com/vue',
      extensions: extensions
    })
  );

  context('Base', () => {
    it('can be created and disposed', () => {
      delay = Cypress.vue; // the ref to the component (which was set in "mountVue")
      delay.$destroy();
      Utils.wasDisposed(delay);
    });
  });

  context('UI', () => {
    it('should render correct contents', () => {});
  });

  context('Audio', () => {
    it('has an output connections', () => {
      delay = Cypress.vue;
      delay.outlets[0].audio.connect(Dummy);
    });
  });
});
