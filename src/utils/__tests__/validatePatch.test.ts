import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateData,
  fixPatch,
  isPatch,
  isModule,
  isConnection,
  isPreset,
} from '../validatePatch';
import { PatchSchema, ModuleSchema, MasterOutSchema } from '~/types/generated';
import type { Patch } from '~/types/generated';

// Minimal preset payload that satisfies PresetSchema — every patch in these
// tests needs at least one, because PatchSchema requires `presets.nonempty()`.
const MIN_PRESETS = [{ name: 'default', parameters: {} }];

// Mock console.warn and console.error
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('isPatch', () => {
  it('should return true for a valid patch', () => {
    const patch = {
      id: 'test-id',
      i: 0,
      name: 'Test Patch',
      modules: [],
      connections: [],
      presets: MIN_PRESETS,
    };
    expect(isPatch(patch)).toBe(true);
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should return false for invalid patches', () => {
    expect(isPatch(null)).toBe(false);
    expect(console.error).toHaveBeenCalled();

    vi.clearAllMocks();

    expect(isPatch({})).toBe(false);
    expect(console.error).toHaveBeenCalled();
  });
});

describe('isModule', () => {
  it('should return true for a valid module', () => {
    const module = {
      id: 1,
      type: 'OSC',
      x: 100,
      y: 200,
      col: 1,
      row: 2
    };
    expect(isModule(module)).toBe(true);
  });

  it('should return false for MasterOut (it has its own schema)', () => {
    // `isModule` intentionally only accepts user-placed modules — MasterOut
    // is validated via MasterOutSchema and special-cased by callers like
    // `fixPatch` via an `id === 0` check.
    const masterOut = {
      id: 0,
      type: 'MasterOut',
      x: 0,
      y: 0
    };
    expect(isModule(masterOut)).toBe(false);
    expect(MasterOutSchema.safeParse(masterOut).success).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(isModule(null)).toBe(false);
    expect(isModule(undefined)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    expect(isModule({})).toBe(false);
    expect(isModule({ id: 1 })).toBe(false);
    expect(isModule({ id: 1, type: 'InvalidType' })).toBe(false); // invalid type
  });
});

describe('isConnection', () => {
  it('should return true for a valid connection', () => {
    const connection = {
      id: 1,
      from: { id: 2, port: 0 },
      to: { id: 3, port: 1 }
    };
    expect(isConnection(connection)).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(isConnection(null)).toBe(false);
    expect(isConnection(undefined)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    expect(isConnection({})).toBe(false);
    expect(isConnection({ id: 1 })).toBe(false);
    expect(isConnection({ id: 1, from: { id: 2, port: 0 } })).toBe(false);
  });
});

describe('isPreset', () => {
  it('should return true for a valid preset', () => {
    const preset = {
      name: 'Default',
      parameters: { 1: { frequency: 440 } }
    };
    expect(isPreset(preset)).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(isPreset(null)).toBe(false);
    expect(isPreset(undefined)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    expect(isPreset({})).toBe(false);
    expect(isPreset({ name: 'Default' })).toBe(false);
    expect(isPreset({ parameters: {} })).toBe(false);
  });
});

describe('Zod schemas', () => {
  describe('ModuleSchema', () => {
    it('should validate correct modules', () => {
      const validModule = {
        id: 1,
        type: 'OSC',
        col: 2,
        row: 3,
        x: 100,
        y: 200
      };
      const result = ModuleSchema.safeParse(validModule);
      expect(result.success).toBe(true);
    });

    it('should validate MasterOut via MasterOutSchema (not ModuleSchema)', () => {
      const masterOut = {
        id: 0,
        type: 'MasterOut',
        x: 0,
        y: 0
      };
      // ModuleSchema excludes MasterOut by design — PatchSchema accepts the
      // union `ModuleSchema | MasterOutSchema` for the modules[] entries.
      expect(ModuleSchema.safeParse(masterOut).success).toBe(false);
      expect(MasterOutSchema.safeParse(masterOut).success).toBe(true);
    });

    it('should validate optional width/height', () => {
      const moduleWithOptionals = {
        id: 1,
        type: 'OSC',
        col: 2,
        row: 3,
        x: 100,
        y: 200,
        w: 2,
        h: 2
      };
      const result = ModuleSchema.safeParse(moduleWithOptionals);
      expect(result.success).toBe(true);
    });

    it('should reject invalid module types', () => {
      const invalidModule = {
        id: 1,
        type: 'InvalidType',
        col: 2,
        row: 3,
        x: 100,
        y: 200
      };
      const result = ModuleSchema.safeParse(invalidModule);
      expect(result.success).toBe(false);
    });
  });

  describe('PatchSchema', () => {
    it('should validate correct patches', () => {
      const validPatch = {
        id: 'test-id',
        i: 0,
        name: 'Test Patch',
        modules: [],
        connections: [],
        presets: MIN_PRESETS,
      };
      const result = PatchSchema.safeParse(validPatch);
      expect(result.success).toBe(true);
    });

    it('should reject patches missing required fields', () => {
      const invalidPatch = {
        id: 'test-id',
        name: 'Test Patch'
        // missing i, modules, connections, presets
      };
      const result = PatchSchema.safeParse(invalidPatch);
      expect(result.success).toBe(false);
    });
  });
});

describe('fixPatch', () => {
  it('should fix a patch with missing id', () => {
    const patch: Partial<Patch> = {
      i: 0,
      name: 'Test Patch',
      modules: [],
      connections: [],
      configs: []
    };
    const result = fixPatch(patch);
    expect(result.id).toBeTruthy();
  });

  it('should fix a patch with missing name', () => {
    const patch: Partial<Patch> = {
      id: 'test',
      i: 0,
      modules: [],
      connections: [],
      configs: []
    };
    const result = fixPatch(patch);
    expect(result.name).toBeTruthy();
  });

  it('returns a valid patch even for heavily malformed input', () => {
    // fixPatch backfills every required field from `state()` defaults, so the
    // result always satisfies PatchSchema. The internal "cannot be fixed"
    // throw is effectively unreachable with the current defaults.
    const broken: Partial<Patch> = {
      id: 'test',
      name: 'Test',
      // Intentionally missing i, modules, connections, presets.
    };

    const result = fixPatch(broken);
    expect(isPatch(result)).toBe(true);
    expect(result.id).toBe('test');
    expect(result.name).toBe('Test');
    expect(result.modules.length).toBeGreaterThan(0); // MasterOut injected
    expect(result.presets.length).toBeGreaterThan(0);
  });
});

describe('validateData', () => {
  it('should throw error for null or undefined', () => {
    expect(() => validateData(null)).toThrow('Invalid patches array.');
    expect(() => validateData(undefined)).toThrow('Invalid patches array.');
  });

  it('should throw error for empty array', () => {
    expect(() => validateData([])).toThrow('Invalid patches array.');
  });

  it('should throw error for non-array', () => {
    expect(() => validateData('not an array')).toThrow('Invalid patches array.');
  });

  it('returns true when every patch passes schema validation', () => {
    const patches = [
      { id: 'test1', i: 0, name: 'Test 1', modules: [], connections: [], presets: MIN_PRESETS },
      { id: 'test2', i: 1, name: 'Test 2', modules: [], connections: [], presets: MIN_PRESETS },
    ];
    expect(validateData(patches)).toBe(true);
  });

  it('returns false when any patch fails schema validation', () => {
    const patches = [
      { id: 'test1', i: 0, name: 'Test 1', modules: [], connections: [], presets: MIN_PRESETS }, // valid
      { id: 'test2', name: 'Test 2' }, // invalid — missing required fields
    ];
    expect(validateData(patches)).toBe(false);
  });
});
