import { shallow, mount } from 'vue-test-utils';
import { createRenderer } from 'vue-server-renderer';
// import VCO from '@/components/VCO.vue';
import VCO from '../../../src/components/VCO.vue';
import { Util } from '../../support/utils';
import { Node } from '../../support/dummy';

// const localVue = createLocalVue();
// // localVue.use(MyPlugin)j // vuex, audioUnit mixins


describe('VCO.vue', () => {
  it('can be created and disposed', () => {
    const vco = shallow(VCO, {
      propsData: { }
    });


    vco.destroy();
    Util.wasDisposed(vco);
  });


  it('should render correct contents', () => {
    const renderer = createRenderer();
    const vco = shallow(VCO, {
      propsData: { id: 1, col: 1, row: 1 }
    });

    renderer.renderToString(vco.vm, (err, str) => {
      if (err) throw new Error(err);
      expect(str).toMatchSnapshot();
    });
  });


  it('handles input and output connections', () => {
    const vco = shallow(VCO, {
      propsData: { }
    });

    vco.connect(Node);
    // Node.connect(vco.inlets[0].data);
    Node.connect(vco.inlets[1].audio);
    Node.connect(vco.inlets[2].audio);

    vco.destroy();
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


  it('can connect to detune and frequency', () => {
    // var instance = new Constr(args);
    // Test.connect(instance.frequency);
    // Test.connect(instance.detune);
    // instance.dispose();
  });
});
