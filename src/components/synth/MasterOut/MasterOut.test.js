import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MasterOut from './MasterOut.vue';
import { useAppStore } from '@/stores';
import { context } from '@/audio';

// Mock the store
vi.mock('@/stores', () => ({
  useAppStore: vi.fn(() => ({
    patch: {
      modules: [{ x: 0, y: 0 }]
    },
    setFocus: vi.fn(),
    clearFocus: vi.fn(),
    addToRegistry: vi.fn()
  }))
}));

// Mock the audio context
vi.mock('@/audio', () => ({
  context: {
    destination: {},
    currentTime: 0
  },
  gainNode: vi.fn(() => ({
    gain: {
      linearRampToValueAtTime: vi.fn()
    },
    connect: vi.fn()
  }))
}));

describe('MasterOut', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(MasterOut);
  });

  it('renders correctly', () => {
    expect(wrapper.find('#master-out').exists()).toBe(true);
    expect(wrapper.find('.module-interface').exists()).toBe(true);
    expect(wrapper.find('.module-connections').exists()).toBe(true);
  });

  it('has correct initial gain value', () => {
    const input = wrapper.find('input[type="range"]');
    expect(input.element.value).toBe('0.5');
  });

  it('updates gain when slider changes', async () => {
    const input = wrapper.find('input[type="range"]');
    await input.setValue(0.7);
    expect(wrapper.vm.gain).toBe(0.7);
  });

  it('has correct number of inlets', () => {
    expect(wrapper.vm.inlets).toHaveLength(2);
    expect(wrapper.vm.inlets[0].label).toBe('out-1');
    expect(wrapper.vm.inlets[1].label).toBe('out-2');
  });

  it('handles mouse events correctly', async () => {
    const store = useAppStore();
    await wrapper.trigger('mouseover');
    expect(store.setFocus).toHaveBeenCalledWith(0);

    await wrapper.trigger('mouseout');
    expect(store.clearFocus).toHaveBeenCalled();
  });
});