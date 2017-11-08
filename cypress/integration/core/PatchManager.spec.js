import { shallow, createLocalVue } from 'vue-test-utils'
import PatchManager from '@/PatchManager.vue';


describe('PatchManager.vue', () => {
  it('should load default patches', () => {
    const patchmanager = shallow(PatchManager, {
      propsData: {}
    });

    // ...
  });

  it('user can load a new patch', () => {
    const patchmanager = shallow(PatchManager, {
      propsData: {}
    });

    // ...
  });

  it('user can save a patch', () => {
    const patchmanager = shallow(PatchManager, {
      propsData: {}
    });

    // ...
  });
});
