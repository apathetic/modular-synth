import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fixPatch } from '../validatePatch';

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

const basePatch = (overrides: Partial<Patch> = {}): Partial<Patch> => ({
  id: 'fix-test',
  i: 10,
  loaded: false,
  name: 'Fix',
  modules: [{ id: 0, type: 'MasterOut', x: 0, y: 0 } as MasterOut],
  connections: [],
  presets: [{ name: 'default', parameters: {} }],
  ...overrides,
});

describe('fixPatch — preset parameters', () => {
  it('passes through well-formed `${moduleId}-${param}` keys untouched', () => {
    const patch = basePatch({
      presets: [{ name: 'clean', parameters: { '1-freq': 440, '1-mod': 0.5 } }],
    });

    const fixed = fixPatch(patch);
    expect(fixed.presets[0]!.parameters).toEqual({ '1-freq': 440, '1-mod': 0.5 });
  });

  it('leaves empty preset parameters empty (not undefined)', () => {
    const patch = basePatch({
      presets: [{ name: 'empty', parameters: {} }],
    });

    const fixed = fixPatch(patch);
    expect(fixed.presets[0]!.parameters).toEqual({});
  });
});

describe('fixPatch — runtime `loaded` flag', () => {
  it('always resets `loaded` to false, even when the source says true', () => {
    const patch = basePatch({ loaded: true });
    expect(fixPatch(patch).loaded).toBe(false);
  });
});

describe('fixPatch — required fields', () => {
  it('backfills missing id / name / i with defaults', () => {
    const fixed = fixPatch({
      modules: [{ id: 0, type: 'MasterOut', x: 0, y: 0 } as MasterOut],
      connections: [],
      presets: [{ name: 'x', parameters: {} }],
    });

    expect(typeof fixed.id).toBe('string');
    expect(typeof fixed.name).toBe('string');
    expect(Number.isFinite(fixed.i)).toBe(true);
  });

  it('returns a default patch for non-objects', () => {
    const fixed = fixPatch(null);
    expect(fixed).toBeDefined();
    expect(Array.isArray(fixed.modules)).toBe(true);
  });

  it('drops connection entries that fail schema validation', () => {
    const patch = basePatch({
      connections: [
        { id: 1, from: { id: 2, port: 0 }, to: { id: 3, port: 1 } },
        // garbage — should be filtered out
        { id: 2, nope: true } as unknown as Connection,
      ],
    });

    const fixed = fixPatch(patch);
    expect(fixed.connections).toHaveLength(1);
    expect(fixed.connections[0]!.id).toBe(1);
  });

  it('injects MasterOut when missing from modules', () => {
    const patch = basePatch({
      modules: [{ id: 1, type: 'OSC', col: 0, row: 0, x: 0, y: 0 } as Module],
    });

    const fixed = fixPatch(patch);
    const hasMasterOut = fixed.modules.some(
      (m): m is MasterOut => (m as MasterOut).id === 0 && (m as MasterOut).type === 'MasterOut',
    );
    expect(hasMasterOut).toBe(true);
  });
});
