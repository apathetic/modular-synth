import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createAppStore } from '@/stores/app';
import { basicPatch } from '@/synths/basic';
import { MASTER_ID } from '@/audio/master';

const freshStore = (patches: Patch[] = [basicPatch()]) => {
  const useStore = createAppStore({ patches });
  const store = useStore();
  store.patch = store.patches[0]!;
  store.patch.loaded = true;
  store.patchId = 0;
  store.presetId = 0;
  return store;
};

beforeEach(() => {
  setActivePinia(createPinia());
  localStorage.clear();
});

describe('rackModules getter', () => {
  it('excludes the MasterOut sentinel (id=0)', () => {
    const store = freshStore();

    // `store.modules` is the ground truth and includes MasterOut.
    expect(store.modules.some((m: Module) => m.id === MASTER_ID)).toBe(true);

    // `rackModules` is what anything iterating `<Unit>`s should bind to.
    expect(store.rackModules.some((m: Module) => m.id === MASTER_ID)).toBe(false);
  });

  it('preserves every non-master module', () => {
    const store = freshStore();

    const nonMaster = store.modules.filter((m: Module) => m.id !== MASTER_ID);
    expect(store.rackModules).toHaveLength(nonMaster.length);
    expect(store.rackModules.map((m) => m.id).sort()).toEqual(
      nonMaster.map((m) => m.id).sort()
    );
  });

  it('reacts when patch.modules changes', () => {
    const store = freshStore();
    const before = store.rackModules.length;

    store.patch.modules = store.patch.modules.filter((m: Module) => m.id !== 1);

    expect(store.rackModules).toHaveLength(before - 1);
    expect(store.rackModules.some((m: Module) => m.id === 1)).toBe(false);
  });
});
