import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createAppStore } from '@/stores/app';
import { state as blank } from '@/stores/patch';
import { basicPatch } from '@/synths/basic';

const freshStore = (patches: Patch[] = [basicPatch()]) => {
  const useStore = createAppStore({ patches });
  const store = useStore();
  // `loadPatch` is async (awaits nextTick) and flips `loaded=true`. We short-
  // circuit so `connections`/`presets` getters return live data immediately.
  store.patch = store.patches[0]!;
  store.patch.loaded = true;
  store.patchId = 0;
  store.presetId = 0;
  return store;
};

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('setParameter', () => {
  it('writes parameters[moduleId][param] into the active preset', () => {
    const store = freshStore();

    store.setParameter({ moduleId: 1, param: 'freq', value: 880 });

    expect(store.getParameter(1, 'freq')).toBe(880);
    expect(store.patch.presets[store.presetId]!.parameters[1]!.freq).toBe(880);
  });

  it('overwrites an existing value for the same (moduleId, param)', () => {
    const store = freshStore();
    store.setParameter({ moduleId: 1, param: 'freq', value: 100 });
    store.setParameter({ moduleId: 1, param: 'freq', value: 200 });

    expect(store.getParameter(1, 'freq')).toBe(200);
  });

  it('creates the module bucket on first write', () => {
    const store = freshStore([blank()]);
    expect(store.patch.presets[0]!.parameters[7]).toBeUndefined();

    store.setParameter({ moduleId: 7, param: 'foo', value: 42 });

    expect(store.patch.presets[0]!.parameters[7]).toEqual({ foo: 42 });
  });

  it('only mutates the currently-selected preset', () => {
    const store = freshStore();
    store.addPreset(); // clones current preset and selects it
    expect(store.presetId).toBe(1);

    store.setParameter({ moduleId: 1, param: 'freq', value: 999 });

    expect(store.patch.presets[1]!.parameters[1]!.freq).toBe(999);
    expect(store.patch.presets[0]!.parameters[1]!.freq).not.toBe(999);
  });

  it('accepts string values (e.g. Dropdown selections)', () => {
    const store = freshStore();
    store.setParameter({ moduleId: 2, param: 'waveform', value: 'square' });
    expect(store.getParameter(2, 'waveform')).toBe('square');
  });
});

describe('removeParameter', () => {
  it('deletes the leaf from every preset, not just the active one', () => {
    const store = freshStore();
    store.setParameter({ moduleId: 1, param: 'freq', value: 100 });
    store.addPreset(); // inherits `1.freq`
    store.setParameter({ moduleId: 1, param: 'mod', value: 0.5 });

    expect(store.patch.presets[0]!.parameters[1]!.freq).toBe(100);
    expect(store.patch.presets[1]!.parameters[1]!.freq).toBe(100);

    store.removeParameter({ moduleId: 1, param: 'freq' });

    expect(store.patch.presets[0]!.parameters[1]?.freq).toBeUndefined();
    expect(store.patch.presets[1]!.parameters[1]?.freq).toBeUndefined();
    // unrelated leaves untouched
    expect(store.patch.presets[1]!.parameters[1]!.mod).toBe(0.5);
  });

  it('drops the module bucket when its last leaf is removed', () => {
    const store = freshStore([blank()]);
    store.setParameter({ moduleId: 9, param: 'only', value: 1 });
    expect(store.patch.presets[0]!.parameters[9]).toEqual({ only: 1 });

    store.removeParameter({ moduleId: 9, param: 'only' });

    expect(store.patch.presets[0]!.parameters[9]).toBeUndefined();
  });

  it('is a no-op for an unknown (moduleId, param)', () => {
    const store = freshStore();
    store.setParameter({ moduleId: 1, param: 'freq', value: 100 });

    expect(() => store.removeParameter({ moduleId: 9, param: 'missing' })).not.toThrow();
    expect(store.getParameter(1, 'freq')).toBe(100);
  });
});

describe('addPreset / removePreset', () => {
  it('addPreset clones the current preset parameters and selects the new one', () => {
    const store = freshStore();
    store.setParameter({ moduleId: 1, param: 'freq', value: 440 });

    store.addPreset();

    expect(store.presetId).toBe(1);
    expect(store.patch.presets[1]!.parameters[1]!.freq).toBe(440);
  });

  it('removePreset refuses to delete the last preset', () => {
    const store = freshStore([blank()]);

    store.removePreset(0);
    expect(store.patch.presets).toHaveLength(1);
  });

  it('removePreset drops the addressed preset and re-selects index 0', () => {
    const store = freshStore();
    store.addPreset();
    expect(store.patch.presets).toHaveLength(2);

    store.removePreset(1);

    expect(store.patch.presets).toHaveLength(1);
    expect(store.presetId).toBe(0);
  });
});
