import LFO from '@/components/LFO.vue';
import mountVue from 'cypress-vue-unit-test';
import { extensions } from '../../support/extensions';
import { Utils, Dummy } from '../../support/utils';

let lfo;

describe('LFO.vue', () => {
  beforeEach(
    mountVue(LFO, {
      vue: 'https://unpkg.com/vue',
      extensions: extensions
    })
  );


  context('Base', () => {
    it('can be created and disposed', () => {
      lfo = Cypress.vue; // the ref to the component (which was set in "mountVue")
      lfo.$destroy();
      Utils.wasDisposed(lfo);
    });
  });


  context('UI', () => {
    it('should render correct contents', () => {});
  });


  context('Audio', () => {
    it('has an output connection', () => {
      lfo = Cypress.vue;
      lfo.outlets[0].audio.connect(Dummy);
    });

    it('outputs a signal', () => {
      return OutputAudio(function() {
        var lfo = new LFO(100, 10, 20);
        lfo.toMaster();
        lfo.start();
      });
    });
  });
});
