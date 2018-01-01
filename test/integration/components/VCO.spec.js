import VCO from '@/components/VCO.vue';
// import store from '@/store';

import mountVue from 'cypress-vue-unit-test';
import { extensions } from '../../support/extensions';
import { Utils } from '../../support/utils';
import { Dummy } from '../../support/dummy';


let vco;
const propsData = {
  id: 1,
  col: 1,
  row: 1,
  coords: { x: 0, y: 0 }
};




describe('VCO.vue', () => {
  beforeEach(mountVue(VCO, {
    // vue: 'https://unpkg.com/vue',
    vue: 'http://localhost:8000/vue.js',
    extensions: extensions
  }));

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
    vco = Cypress.vue;

    Dummy.connect(vco.inlets[1].audio);
    Dummy.connect(vco.inlets[2].audio);

    vco.$destroy();
  });


  it('can set frequency', () => {
    const freq1 = 123;
    const freq2 = 456;

    vco = Cypress.vue; // the ref to the component (which was set in "mountVue")

    vco.setFreq(freq1);
    expect(vco.osc_.frequency.value).to.equal(freq1);
    vco.setFreq(freq2);
    expect(vco.osc_.frequency.value).to.equal(freq2);
  });


  it('has a primary oscillator', () => {
  });


  it('can create connection to detune and frequency', () => {
    // var instance = new Constr(args);
    // Test.connect(instance.frequency);
    // Test.connect(instance.detune);
    // instance.dispose();
  });


  it ('can get and set the type', () => {
  });


  it('outputs a signal', () => {
    return OutputAudio(function(){
      var lfo = new LFO(100, 10, 20);
      lfo.toMaster();
      lfo.start();
    });
  });
});
