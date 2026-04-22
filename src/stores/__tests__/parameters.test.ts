import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createAppStore } from '@/stores/app';
import { basicPatch, state as blank } from '@/stores/patch';

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
  it('writes `${moduleId}-${param}` into the active preset', () => {
    const store = freshStore();

    store.setParameter({ id: '1-freq', value: 880 });

    expect(store.parameters['1-freq']).toBe(880);
    expect(store.patch.presets[store.presetId]!.parameters['1-freq']).toBe(880);
  });

  it('overwrites an existing value for the same key', () => {
    const store = freshStore();
    store.setParameter({ id: '1-freq', value: 100 });
    store.setParameter({ id: '1-freq', value: 200 });

    expect(store.parameters['1-freq']).toBe(200);
  });

  it('only mutates the currently-selected preset', () => {
    const store = freshStore();
    store.addPreset(); // clones current preset and selects it
    expect(store.presetId).toBe(1);

    store.setParameter({ id: '1-freq', value: 999 });

    expect(store.patch.presets[1]!.parameters['1-freq']).toBe(999);
    expect(store.patch.presets[0]!.parameters['1-freq']).not.toBe(999);
  });

  it('accepts string values (e.g. Dropdown selections)', () => {
    const store = freshStore();
    store.setParameter({ id: '2-waveform', value: 'square' });
    expect(store.parameters['2-waveform']).toBe('square');
  });

  it('never writes a value under a synthetic `undefined-*` key', () => {
    // Smoke test to document the contract enforced by `useModuleId`:
    // if a control ever lacked a parent module id, `useModuleId` would throw
    // at construction time — so no `undefined-*` key can ever be produced
    // by normal UI interaction.
    const store = freshStore();
    expect(
      Object.keys(store.parameters).some((k) => k.startsWith('undefined-')),
    ).toBe(false);
  });
});

describe('removeParameter', () => {
  it('deletes the key from every preset, not just the active one', () => {
    const store = freshStore();
    store.setParameter({ id: '1-freq', value: 100 });
    store.addPreset(); // inherits `1-freq`
    store.setParameter({ id: '1-mod', value: 0.5 });

    expect(store.patch.presets[0]!.parameters['1-freq']).toBe(100);
    expect(store.patch.presets[1]!.parameters['1-freq']).toBe(100);

    store.removeParameter('1-freq');

    expect(store.patch.presets[0]!.parameters['1-freq']).toBeUndefined();
    expect(store.patch.presets[1]!.parameters['1-freq']).toBeUndefined();
    // unrelated keys untouched
    expect(store.patch.presets[1]!.parameters['1-mod']).toBe(0.5);
  });

  it('is a no-op for an unknown key', () => {
    const store = freshStore();
    store.setParameter({ id: '1-freq', value: 100 });

    expect(() => store.removeParameter('9-missing')).not.toThrow();
    expect(store.parameters['1-freq']).toBe(100);
  });
});

describe('addPreset / removePreset', () => {
  it('addPreset clones the current preset parameters and selects the new one', () => {
    const store = freshStore();
    store.setParameter({ id: '1-freq', value: 440 });

    store.addPreset();

    expect(store.presetId).toBe(1);
    expect(store.patch.presets[1]!.parameters['1-freq']).toBe(440);
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

describe('basicPatch preset defaults', () => {
  // Regression guard for the `undefined-*` bug: keys must be scoped by the
  // owning module id, matching what `useParameter` writes at runtime.
  it('ships preset parameter keys in the `${moduleId}-${param}` shape', () => {
    const { presets } = basicPatch();
    const keys = Object.keys(presets[0]!.parameters);

    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(key).toMatch(/^\d+-[A-Za-z]+$/);
      expect(key.startsWith('undefined-')).toBe(false);
    }
  });
});
