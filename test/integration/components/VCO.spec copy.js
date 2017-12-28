import Vue from 'vue';
import mountVue from 'cypress-vue-unit-test';
import { createLocalVue, shallow } from 'vue-test-utils';

import VCO from '@/components/VCO.vue';
import inlets from '@/components/functional/inlets';
import store from '@/store';
import { context } from '@/audio';
import { Utils } from '../../support/utils';
import { Dummy } from '../../support/dummy';



const localVue = createLocalVue();
localVue.mixin({
  data() {
    return {
      context: new window.AudioContext()
    };
  }
});



let vco;
const propsData = {
  id: 1,
  col: 1,
  row: 1,
  coords: { x: 0, y: 0 }
};

const extensions = {
  mixin: [{
    data() {
      return { context };
    }
  }],
  components: {
    inlets
  }
}

describe('VCO.vue', () => {
  beforeEach(mountVue(VCO, {
    vue: 'https://unpkg.com/vue',
    extensions: extensions
  }));

  // const getRoot = () => cy.window().its('wes')
  // const getStore = () => cy.window().its('app.$store')
  // const getVCO = () => cy.get('.module')

  it('can be created and disposed', () => {
    // A)
    // mountVue(VCO);
    vco = Cypress.vue; // the ref to the component (which was set in "mountVue")

    // B)
    // const Constructor = Vue.extend(VCO);
    // vco = new Constructor({ propsData }).$mount();
    // console.log(vco);
    // console.log('--------------------');

    // C)
    // const wrapper = shallow(VCO, {
    //   propsData,
    //   store,
    //   localVue
    // });
    // // wrapper.setProps(propsData)
    // vco = wrapper.vm;
    // console.log(vco);
    // console.log('--------------------');


    vco.$destroy();
    // Utils.wasDisposed(vco);
  });


  it('should render correct contents', () => {
    // const renderer = createRenderer();
    // const vco = shallow(VCO, {
    //   propsData: { id: 1, col: 1, row: 1 }
    // });

    // renderer.renderToString(vco.vm, (err, str) => {
    //   if (err) throw new Error(err);
    //   expect(str).toMatchSnapshot();
    // });
  });


  it('handles input and output connections', () => {
    // const wrapper = shallow(VCO, {
    //   propsData,
    //   store,
    //   localVue
    // });
    // vco = wrapper.vm;
    vco = Cypress.vue; // the ref to the component (which was set in "mountVue")




    // vco.connect(Dummy);
    // Dummy.connect(vco.inlets[0].data);
    Dummy.connect(vco.inlets[1].audio);
    Dummy.connect(vco.inlets[2].audio);

    vco.$destroy();
  });


  it('can set frequency', () => {
    const freq1 = 123;
    const freq2 = 456;
    const vco = shallow(VCO, {
      propsData: { }
    });

    vco.setFreq(freq1);
    expect(vco.osc_.frequency.value).to.be(freq1);
    vco.setFreq(freq2);
    expect(vco.osc_.frequency.value).to.be(freq2);
  });


  it('has a primary oscillator', () => { });


  it('can create connection to detune and frequency', () => {
    // var instance = new Constr(args);
    // Test.connect(instance.frequency);
    // Test.connect(instance.detune);
    // instance.dispose();
  });

  it ("can get and set the type", function(){
  });


  it("outputs a signal", function(){
    return OutputAudio(function(){
      var lfo = new LFO(100, 10, 20);
      lfo.toMaster();
      lfo.start();
    });
  });
});
