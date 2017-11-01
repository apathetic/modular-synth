import { shallow } from 'vue-test-utils'
import { createRenderer } from 'vue-server-renderer'
import Synth from '@/Synth.vue';


describe('Synth.vue', () => {

  it('matches snapshot', () => {
    const renderer = createRenderer()
    const app = shallow(Synth, {
      propsData: {}
    });

    renderer.renderToString(app.vm, (err, str) => {
      if (err) throw new Error(err);
      expect(str).toMatchSnapshot();
    });
  });


  it('should render correct contents', () => {
    const app = shallow(Synth, {
      propsData: {}
    });

    // expect(app.find('#modules').to.exist());
    // expect(app.find('#connections').to.exist());
    // expect(app.find('#aside').to.exist());
    // expect(app.find('#master-out').to.exist());
  });


  it('user can drag a module in edit mode', () => {});

  it('audio is routed correctly after load', () => {});

});
