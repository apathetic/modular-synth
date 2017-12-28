import { createLocalVue, shallow } from 'vue-test-utils';
const localVue = createLocalVue();
localVue.mixin({
  data() {
    return {
      context: new window.AudioContext()
    };
  }
});

// const mountVue = require('cypress-vue-unit-test');
import mountVue from 'cypress-vue-unit-test';
import Synth from '../../../src/Synth.vue';
import VCO from '../../../src/components/VCO.vue';
import { Utils } from '../../support/utils';
import { Dummy } from '../../support/dummy';

let vco;
const propsData = { id: 1, col: 1, row: 1 };



describe('env.vue', () => {

  it('can be created and disposed', () => {
    // A)
    // mountVue(VCO);
    // vco = Cypress.vue; // the ref to the component (which was set in "mountVue")

    // B)
    const Constructor = Vue.extend(VCO);
    vco = new Constructor({ propsData }).$mount();

    // C)
    // const wrapper = shallow(VCO, {
    //   localVue
    // });

    cy
      .window()
      .its('app')
      .then(app => {

        console.log(app);
      });


    console.log('--------------------');
    console.log(vco);
    console.log(cy);
    console.log('--------------------');

    vco.$destroy();
    // Utils.wasDisposed(vco);
  });


  it('should render correct contents', () => {
  });


  it("has an output connections", function(){
    var env = new Envelope();
    env.connect(Test);
    env.dispose();
  });


  it ("passes no signal before being triggered", function(){
    return Offline(function(){
      new Envelope().toMaster();
    }).then(function(buffer){
      expect(buffer).to.equal.true;
    });
  });


  it ("passes signal once triggered", function(){
    return Offline(function(){
      var env = new Envelope().toMaster();
      env.triggerAttack(0.05);
    }).then(function(buffer){
      expect(buffer.getFirstSoundTime()).to.be.closeTo(0.05, 0.001);
    }, 0.1);
  });
});
