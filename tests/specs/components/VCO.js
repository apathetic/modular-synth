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
      cy.get('.oscillator').snapshot();

      // throw Error('need content snapshot'); // TODO
    });
  });


  context('Audio', () => {

    it('can set frequency', () => {
      const f = 123;

      vco = Cypress.vue;
      vco.setFreq(f);

      // account for freq ramp / transition time
      cy.wait(20).then(() => {
        expect(vco.freq).to.equal(f);
        expect(vco.osc_.frequency.value).to.equal(f);
      });
    });


    it('can set mod depth', () => {
      vco = Cypress.vue;

      dummy.gain.value = 100;
      dummy.connect(vco.inlets[1].audio);

      // expect  vco.osc_.detune.to.be 100

      vco.$destroy();
    });


    it('can set pulse width', () => {
      // var instance = new Constr(args);
      // Test.connect(instance.frequency);
      // Test.connect(instance.detune);
      // instance.dispose();
      vco = Cypress.vue;

      dummy.gain.value = 100;
      dummy.connect(vco.inlets[3].audio);

      // expect  vco.pulse_.to.be 100

      vco.$destroy();
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
