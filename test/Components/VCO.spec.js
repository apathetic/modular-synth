import { shallow, mount } from 'vue-test-utils';
import { createRenderer } from 'vue-server-renderer';
import VCO from '@/components/VCO.vue';
import { Util, Node } from '../utils';

// const localVue = createLocalVue();
// // localVue.use(MyPlugin)j // vuex, audioUnit mixins




describe('VCO.vue', () => {
  let component;

  beforeEach(() => {
    component = shallow(VCO, { // Create a shallow instance of the component
      data: { }
    });
  });

  it('can be created and disposed', function(){
    component.destroy();
    Util.wasDisposed(component);
  });

  it('handles input and output connections', function(){
    component.connect(Node);
    // Node.connect(component.inlets[0].data);
    Node.connect(component.inlets[1].audio);
    Node.connect(component.inlets[2].audio);

    components.destroy();
  });

  it('can set frequency', function(){
    const freq1 = 123;
    const freq2 = 456;

    component.setFreq(freq1);
    expect(component.osc_.frequency.value).to.be(freq1);
    component.setFreq(freq2);
    expect(component.osc_.frequency.value).to.be(freq2);
  });

  it("can connect to detune and frequency", function(){
    var instance = new Constr(args);
    Test.connect(instance.frequency);
    Test.connect(instance.detune);
    instance.dispose();
  });

  it('should render correct contents', () => {
    const rackInfo = { id: 1, col: 1, row: 1};
    const renderer = createRenderer();
    const wrapper = shallow(VCO, {
      propsData: { rackInfo }
    })

    expect(component.$el).toMatchSnapshot();
    // renderer.renderToString(wrapper.vm, (err, str) => {
    //   if (err) throw new Error(err);

    //   expect(str).toMatchSnapshot();
    // });
  });

  it('has a primary oscillator', () => {



  });

});
