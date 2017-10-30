import Vue from 'vue'
import Vuex from 'vuex'
import { mount } from 'vue-test-utils'
import Actions from '@/store/actions'

jest.mock('setActive', jest.fn);
jest.mock('clearActive', jest.fn);


Vue.use(Vuex);

if (!global.window.localStorage) {
  global.window.localStorage = {
    getItem() { return '{}'; },
    setItem() {}
  };
}

describe('actions', () => {
  let actions;
  let store;

  beforeEach(() => {
    actions = {
      setActive: sinon.stub(),
      clearActive: sinon.stub()
    },
    store = new Vuex.Store({
      state: {},
      actions
    })
  });

  it('calls store action actionInput when input value is input and an input even is fired', () => {
    const wrapper = mount(Actions, { store })
    const input = wrapper.find('input')[0];
    input.element.value = 'input';
    input.trigger('input');
    // expect(actions.actionInput.calledOnce).toBe(true)
  });

});
