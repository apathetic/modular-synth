import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Power from './Power.vue';
import { useAppStore } from '@/stores/app';
import { context } from '@/audio';

// Mock the store
vi.mock('@/stores/app', () => ({
  useAppStore: vi.fn(() => ({
    power: false,
  }))
}));

// Mock the audio context
vi.mock('@/audio', () => ({
  context: {
    resume: vi.fn(),
    suspend: vi.fn()
  }
}));

describe('Power', () => {
  let wrapper;
  let store;

  beforeEach(() => {
    store = useAppStore();
    wrapper = mount(Power);
  });

  it('renders correctly', () => {
    expect(wrapper.find('.power').exists()).toBe(true);
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('has correct initial state', () => {
    expect(wrapper.classes()).toContain('off');
    expect(wrapper.classes()).not.toContain('on');
  });

  it('toggles power state when clicked', async () => {
    await wrapper.trigger('click');
    expect(store.power).toBe(true);
    expect(context.resume).toHaveBeenCalled();

    await wrapper.trigger('click');
    expect(store.power).toBe(false);
    expect(context.suspend).toHaveBeenCalled();
  });

  it('updates class based on power state', async () => {
    store.power = true;
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain('on');
    expect(wrapper.classes()).not.toContain('off');

    store.power = false;
    await wrapper.vm.$nextTick();
    expect(wrapper.classes()).toContain('off');
    expect(wrapper.classes()).not.toContain('on');
  });
});