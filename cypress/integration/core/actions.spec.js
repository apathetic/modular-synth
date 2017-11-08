import Vue from 'vue'
import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import actions from '../../../src/store/actions'


Vue.use(Vuex);


describe('actions', () => {
  // let actions;
  let store;

  beforeEach(() => {
    store = new Vuex.Store({
      state: {},
      actions
    })
  });

  it('calls store action actionInput when input value is input and an input even is fired', () => {
    const wrapper = mount(actions, { store })
    const input = wrapper.find('input')[0];
    input.element.value = 'input';
    input.trigger('input');
    // expect(actions.actionInput.calledOnce).toBe(true)
  });

  // Assert that user can add a new module (and store is updated)

});
