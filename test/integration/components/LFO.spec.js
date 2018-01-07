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

    it('can set mod depth via the UI', () => {});

    it('can set frequency via the UI', () => {});
  });


  context('Type', () => {
    it('can get and set the type', () => {
      const type = 'triangle';

      lfo = Cypress.vue;

      lfo.setType(type);
      expect(lfo.lfo.type).to.equal(type);
    });

    it('handles 4 basic types', () => {
      const types = ['triangle', 'sawtooth', 'sine', 'square'];

      lfo = Cypress.vue;
      for (let i = 0; i < types.length; i++) {
        lfo.setType(types[i]);
        expect(lfo.lfo.type).to.equal(types[i]);
      }
    });
  });


  context('Audio', () => {
    it('has an output connection', () => {
      lfo = Cypress.vue;
      lfo.outlets[0].audio.connect(Dummy);
    });

    it('makes a sound', () => {
      return OutputAudio(function() {
        var lfo = new LFO(100, 10, 20);
        lfo.toMaster();
        lfo.start();
      });
    });

    it('has an input connection', () => {
    });

    it('its depth may be modulated', () => {
      lfo = Cypress.vue;

      // connect something to depth
      // Dummy.connect(lfo.mod);

      // check output
      const sample = lfo.outlets[0].audio.value;
      expect(sample).to.be.closeTo(0, 0.001);
      // expect(sample).to.be.within(0, 1);
    });
  });

  it('its output may be rectified via offset', () => {

  });
});
