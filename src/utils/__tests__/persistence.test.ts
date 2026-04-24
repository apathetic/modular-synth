import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  STORAGE_VERSION,
  loadPatches,
  serializePatches,
  clearStorage,
} from '../persistence';
import { basicPatch } from '~/synths/basic';
import { dx7Patch } from '~/synths/dx7';

const LEGACY_KEY = 'patches';

// Minimal valid patch used across the round-trip / serialization tests.
// Mirrors the PatchSchema shape so `isPatch` passes without invoking
// any repair path.
const makeValidPatch = (overrides: Partial<Patch> = {}): Patch => ({
  id: 'patch-uuid-1',
  i: 10,
  loaded: false,
  name: 'Test',
  modules: [{ id: 0, type: 'MasterOut', x: 0, y: 0 } as MasterOut],
  connections: [],
  presets: [{ name: 'default', parameters: { 1: { freq: 440 } } }],
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('loadPatches', () => {
  it('returns the shipped default patches when localStorage is empty', () => {
    const patches = loadPatches();
    expect(patches).toHaveLength(2);
    expect(patches[0]!.name).toBe(dx7Patch().name);
    expect(patches[1]!.name).toBe(basicPatch().name);
    expect(patches[0]!.loaded).toBe(false);
  });

  it('returns the default patches when the stored JSON is malformed', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json{');
    const patches = loadPatches();
    expect(patches).toHaveLength(2);
    expect(patches[0]!.name).toBe(dx7Patch().name);
    expect(patches[1]!.name).toBe(basicPatch().name);
  });

  it('returns the default patches when the envelope has an empty patches array', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, patches: [] }),
    );
    const patches = loadPatches();
    expect(patches).toHaveLength(2);
    expect(patches[0]!.name).toBe(dx7Patch().name);
    expect(patches[1]!.name).toBe(basicPatch().name);
  });

  it('reads a versioned envelope', () => {
    const stored = makeValidPatch({ name: 'FromEnvelope' });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, patches: [stored] }),
    );

    const [loaded] = loadPatches();
    expect(loaded!.name).toBe('FromEnvelope');
  });

  it('reads a legacy array (pre-envelope) format', () => {
    const stored = makeValidPatch({ name: 'LegacyShape' });
    localStorage.setItem(LEGACY_KEY, JSON.stringify([stored]));

    const [loaded] = loadPatches();
    expect(loaded!.name).toBe('LegacyShape');
  });

  it('always strips a persisted `loaded: true` flag on read', () => {
    // `loaded` is runtime-only; no patch should come back with it set.
    const stored = makeValidPatch({ name: 'Stale', loaded: true as any });
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, patches: [stored] }),
    );

    const [loaded] = loadPatches();
    expect(loaded!.loaded).toBe(false);
  });

  it('repairs a corrupt patch rather than dropping it', () => {
    // Missing `id`, `i`, `name`, `presets` — fixPatch should backfill defaults.
    const corrupt = {
      modules: [{ id: 0, type: 'MasterOut', x: 0, y: 0 }],
      connections: [],
    };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, patches: [corrupt] }),
    );

    const patches = loadPatches();
    expect(patches).toHaveLength(1);
    expect(typeof patches[0]!.id).toBe('string');
    expect(Array.isArray(patches[0]!.presets)).toBe(true);
    expect(patches[0]!.presets.length).toBeGreaterThan(0);
  });

  it('prefers the canonical key over the legacy one', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        patches: [makeValidPatch({ name: 'Canonical' })],
      }),
    );
    localStorage.setItem(
      LEGACY_KEY,
      JSON.stringify([makeValidPatch({ name: 'Legacy' })]),
    );

    const [loaded] = loadPatches();
    expect(loaded!.name).toBe('Canonical');
  });
});

describe('serializePatches', () => {
  it('produces a versioned envelope', () => {
    const body = serializePatches([makeValidPatch()]);
    const parsed = JSON.parse(body);

    expect(parsed.version).toBe(STORAGE_VERSION);
    expect(Array.isArray(parsed.patches)).toBe(true);
    expect(parsed.patches).toHaveLength(1);
  });

  it('strips the transient `loaded` flag before writing', () => {
    const patch = makeValidPatch({ loaded: true as any });
    const body = serializePatches([patch]);
    const parsed = JSON.parse(body);

    expect(parsed.patches[0]).not.toHaveProperty('loaded');
  });

  it('deep-clones the patch so caller state is not mutated', () => {
    const patch = makeValidPatch();
    serializePatches([patch]);
    expect(patch).toHaveProperty('loaded'); // still on original
  });

  it('round-trips through loadPatches preserving identity-bearing fields', () => {
    const original = makeValidPatch({
      id: 'roundtrip',
      name: 'RoundTrip',
      presets: [{
        name: 'p1',
        parameters: { 1: { freq: 220 }, 5: { attack: 0.05 } },
      }],
    });

    localStorage.setItem(STORAGE_KEY, serializePatches([original]));
    const [loaded] = loadPatches();

    expect(loaded!.id).toBe('roundtrip');
    expect(loaded!.name).toBe('RoundTrip');
    // JSON keys come back as strings, so `Number(k)` for numeric lookups
    expect(loaded!.presets[0]!.parameters).toEqual({
      1: { freq: 220 },
      5: { attack: 0.05 },
    });
    expect(loaded!.loaded).toBe(false);
  });
});

describe('clearStorage', () => {
  it('removes both the canonical and legacy keys', () => {
    localStorage.setItem(STORAGE_KEY, 'x');
    localStorage.setItem(LEGACY_KEY, 'y');

    clearStorage();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it('is a no-op when nothing is stored', () => {
    expect(() => clearStorage()).not.toThrow();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('causes loadPatches to fall back to the shipped defaults', () => {
    localStorage.setItem(
      STORAGE_KEY,
      serializePatches([makeValidPatch({ name: 'WillBeCleared' })]),
    );
    clearStorage();

    const patches = loadPatches();
    expect(patches).toHaveLength(2);
    expect(patches[0]!.name).toBe(dx7Patch().name);
    expect(patches[1]!.name).toBe(basicPatch().name);
  });
});
