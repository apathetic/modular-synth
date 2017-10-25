import { shallow } from 'vue-test-utils'
import { createRenderer } from 'vue-server-renderer'
import Knob from '@/components/UI/Knob.vue'

/**
 * Simulate a mouse click + drag over a given distance.
 * @param  {Integer} distance The distance to drag.
 * @return {[type]} [description]
 */
function mouseInteraction(element, distance) {
  element.trigger('mousedown', {});
  element.trigger('mousemove', {
    distance
  });
  element.trigger('mouseup', {});


  // const bar = wrapper.find('#bar')[0];
  //
  // bar.dispatch('click');
}

describe('knob.vue', () => {
  it('has a linear mode', () => {
  });

  it('has a logarithmic mode', () => {
  });

  it('sets min, max, and range correctly', () => {
  });

  it('sets a default value', () => {
  });

  it('sets its value in the store when changed', () => {
  });

  it('updates internal value on "parameters:load"', () => {
  });

  it('displays the correct number of decimals', () => {
  });

});
