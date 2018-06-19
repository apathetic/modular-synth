import VCO from '@/components/VCO.vue';
import mountVue from 'cypress-vue-unit-test';
import { extensions } from '../../support/extensions';
import { wasDisposed, dummy } from '../../support/utils';

let vco;

describe('VCO.vue', () => {
  beforeEach(mountVue(VCO, {
    extensions
  }));

  context('Base', () => {
    it('can be created and disposed', () => {
      vco = Cypress.vue; // the ref to the component (which was set up in "mountVue")
      vco.$destroy();
      vco.$nextTick(() => {
        wasDisposed(vco);
      });
    });
  });


  context('UI', () => {
    it('should render correct contents', () => {
      cy.get('.oscillator').snapshot()

      // throw Error('need content snapshot'); // TODO
    });
  });


  context('Audio', () => {
    it('handles input and output connections', () => {
      vco = Cypress.vue;

      dummy.connect(vco.inlets[1].audio);
      dummy.connect(vco.inlets[2].audio);

      vco.$destroy();
    });


    it('can set frequency', () => {
      const freq1 = 123;
      const freq2 = 456;

      vco = Cypress.vue;

      vco.setFreq(freq1);
      setTimeout(() => {
        expect(vco.osc_.frequency.value).to.equal(freq1);
      }, 100); // account for ramp / transition time

      vco.setFreq(freq2);
      setTimeout(() => {
        expect(vco.osc_.frequency.value).to.equal(freq2);
      }, 100); // account for ramp / transition time
    });


    it('outputs a signal', () => {
      vco = Cypress.vue;
      vco.setFreq(100);

      // expect(vco.outlets[0].audio.to. xxxx // be a signal
      vco.outlets[0].audio.connect(dummy);
    });


    it('cannot be set to DC', () => {
      const def = 440;

      vco = Cypress.vue;
      vco.setFreq(0);

      setTimeout(() => {
        expect(vco.osc_.frequency.value).to.equal(def);
      }, 100);
    });


    it('has a primary oscillator', () => {
    });


    it('can create connection to detune and frequency', () => {
      // var instance = new Constr(args);
      // Test.connect(instance.frequency);
      // Test.connect(instance.detune);
      // instance.dispose();
    });

  });


  context('Type', () => {
    it('can get and set the type', () => {
      const type = 'triangle';

      vco = Cypress.vue;

      vco.setType(type);
      expect(vco.osc_.type).to.equal(type);
    });

    it('handles 4 basic types', () => {
      const types = ['triangle', 'sawtooth', 'sine', 'square'];

      vco = Cypress.vue;
      for (let i = 0; i < types.length; i++) {
        vco.setType(types[i]);
        expect(vco.osc_.type).to.equal(types[i]);
      }
    });

    // it ('throws an error if invalid type is set', () => {
    //   vco = Cypress.vue;
    //   expect(() => {
    //     osc.type = 'invalid';
    //   }).to.throw(Error);
    //   osc.dispose();
    // });
  });
});
