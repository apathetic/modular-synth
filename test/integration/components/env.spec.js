import Env from '@/components/Env.vue';
import mountVue from 'cypress-vue-unit-test';
import { extensions } from '../../support/extensions';
import { Utils, Dummy } from '../../support/utils';

let env;

describe('env.vue', () => {
  beforeEach(
    mountVue(Env, {
      vue: 'https://unpkg.com/vue',
      extensions: extensions
    })
  );

  context('Base', () => {
    it('can be created and disposed', () => {
      env = Cypress.vue; // the ref to the component (which was set in "mountVue")
      env.$destroy();
      Utils.wasDisposed(env);
    });
  });

  context('UI', () => {
    it('should render correct contents', () => {});
  });

  context('Audio', () => {
    it('has an output connections', () => {
      env = Cypress.vue;
      env.outlets[0].audio.connect(Dummy);
    });

    it('passes no signal before being triggered', () => {
      return Offline(() => {
        new Envelope().toMaster();
      }).then(function(buffer) {
        expect(buffer).to.equal.true;
      });
    });

    it('passes signal once triggered', () => {
      return Offline(function() {
        var env = new Envelope().toMaster();
        env.triggerAttack(0.05);
      }).then(function(buffer) {
        expect(buffer.getFirstSoundTime()).to.be.closeTo(0.05, 0.001);
      }, 0.1);
    });
  });
});
