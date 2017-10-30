import { shallow, createLocalVue } from 'vue-test-utils'
import Synth from '@/Synth.vue';
import Node from '@/components/Node';

describe('sortable', () => {

  it('the App can sort modules in play mode', () => {
    const App = shallow(Synth, {
      stubs: {
        Node,
        Node
      }
    });

    // ...
  });

  it('works after loading and reloading a patch', () => {
  });

  it('works after adding a module', () => {
  });

  it('works after removing a module', () => {
  });

});
