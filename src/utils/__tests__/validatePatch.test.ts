import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as ValidatePatchModule from '../validatePatch';
import {
  PatchSchema,
  ModuleSchema,
} from '@/types/generated';

const {
  validateData,
  fixPatch,
  isPatch,
  isModule,
  isConnection,
  isConfig,
} = ValidatePatchModule;

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
      configs: []
    };
    expect(isPatch(patch)).toBe('pass');
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should return false for invalid patches', () => {
    expect(isPatch(null)).toBe('fail');
    expect(console.error).toHaveBeenCalled();

    vi.clearAllMocks();

    expect(isPatch({})).toBe('fail');
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

  it('should return true for MasterOut module', () => {
    const masterOut = {
      id: 0,
      type: 'MasterOut',
      x: 0,
      y: 0
    };
    expect(isModule(masterOut)).toBe(true);
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

describe('isConfig', () => {
  it('should return true for a valid config', () => {
    const config = {
      name: 'Default',
      parameters: { '1-frequency': 440 }
    };
    expect(isConfig(config)).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(isConfig(null)).toBe(false);
    expect(isConfig(undefined)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    expect(isConfig({})).toBe(false);
    expect(isConfig({ name: 'Default' })).toBe(false);
    expect(isConfig({ parameters: {} })).toBe(false);
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

    it('should validate MasterOut', () => {
      const masterOut = {
        id: 0,
        type: 'MasterOut',
        x: 0,
        y: 0
      };
      const result = ModuleSchema.safeParse(masterOut);
      expect(result.success).toBe(true);
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
        configs: []
      };
      const result = PatchSchema.safeParse(validPatch);
      expect(result.success).toBe(true);
    });

    it('should reject patches missing required fields', () => {
      const invalidPatch = {
        id: 'test-id',
        name: 'Test Patch'
        // missing i, modules, connections, configs
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

  it('should throw an error if patch cannot be fixed', () => {
    // Spy on isPatch instead of replacing it
    const mockIsPatch = vi.spyOn(ValidatePatchModule, 'isPatch')
      .mockImplementationOnce(() => 'fail' as any);

    const patch: Partial<Patch> = {
      id: 'test',
      name: 'Test'
      // Intentionally missing all other required fields
    };

    expect(() => fixPatch(patch)).toThrow('PATCH VALIDATION and subsequent fix failed.');

    // Restore spy
    mockIsPatch.mockRestore();
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

  it('should validate each patch in the array', () => {
    // Spy on isPatch instead of replacing it
    const mockIsPatch = vi.spyOn(ValidatePatchModule, 'isPatch')
      .mockImplementation(() => 'pass' as any);

    const patches = [
      { id: 'test1', i: 0, name: 'Test 1', modules: [], connections: [], configs: [] },
      { id: 'test2', i: 1, name: 'Test 2', modules: [], connections: [], configs: [] }
    ];
    const result = validateData(patches);

    expect(result).toHaveLength(2);
    expect(mockIsPatch).toHaveBeenCalledTimes(2);

    // Restore spy
    mockIsPatch.mockRestore();
  });

  it('should fix invalid patches in the array', () => {
    // Spy on isPatch and fixPatch instead of replacing them
    const mockIsPatch = vi.spyOn(ValidatePatchModule, 'isPatch')
      .mockImplementationOnce(() => 'pass' as any)
      .mockImplementationOnce(() => 'fail' as any);

    const mockFixPatch = vi.spyOn(ValidatePatchModule, 'fixPatch');

    const patches = [
      { id: 'test1', i: 0, name: 'Test 1', modules: [], connections: [], configs: [] }, // Valid
      { id: 'test2', name: 'Test 2' } // Invalid, needs fixing
    ];

    validateData(patches);

    // Verify fixPatch was called once for the second patch
    expect(mockFixPatch).toHaveBeenCalledTimes(1);
    expect(mockFixPatch).toHaveBeenCalledWith(patches[1]);

    // Restore spies
    mockIsPatch.mockRestore();
    mockFixPatch.mockRestore();
  });
});
