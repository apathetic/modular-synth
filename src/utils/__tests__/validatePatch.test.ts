import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateData, validatePatch, isPatch } from '../validatePatch';
import { state as blank } from '@/stores/patch';
import type { Patch } from '@/types';

// Mock console.warn
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('isPatch', () => {
  it('should identify valid patch objects', () => {
    const validPatch = blank();
    expect(isPatch(validPatch)).toBe(true);
  });

  it('should reject non-patch objects', () => {
    const invalidCases = [
      null,
      undefined,
      42,
      'string',
      {},
      { name: 'Test' },
      { id: '123', name: 'Test' },
      { modules: [], connections: [] }
    ];

    invalidCases.forEach(testCase => {
      expect(isPatch(testCase)).toBe(false);
    });
  });
});

describe('validatePatch', () => {
  it('should handle null or undefined patch', () => {
    const result1 = validatePatch(null, 0);
    const result2 = validatePatch(undefined, 1);

    expect(isPatch(result1)).toBe(true);
    expect(isPatch(result2)).toBe(true);
  });

  it('should fix missing patch name', () => {
    const mockPatch = {
      ...blank(),
      name: null
    };

    const result = validatePatch(mockPatch, 0);
    expect(result.name).toBeDefined();
    expect(typeof result.name).toBe('string');
  });

  it('should fix missing configs', () => {
    const mockPatch = {
      ...blank(),
      configs: null
    };

    const result = validatePatch(mockPatch, 0);
    expect(Array.isArray(result.configs)).toBe(true);
    expect(result.configs.length).toBeGreaterThan(0);
  });

  it('should handle empty configs array', () => {
    const mockPatch = {
      ...blank(),
      configs: []
    };

    const result = validatePatch(mockPatch, 0);
    expect(result.configs.length).toBe(1);
    expect(result.configs[0].name).toBeDefined();
    expect(result.configs[0].parameters).toBeDefined();
  });

  it('should fix missing modules and connections', () => {
    const mockPatch = {
      ...blank(),
      modules: null,
      connections: null
    };

    const result = validatePatch(mockPatch, 0);
    expect(Array.isArray(result.modules)).toBe(true);
    expect(Array.isArray(result.connections)).toBe(true);
  });
});

describe('validateData', () => {
  it('should handle non-array input', () => {
    const invalidInputs = [null, undefined, {}, 42, 'string'];

    invalidInputs.forEach(input => {
      const result = validateData(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(isPatch(result[0])).toBe(true);
    });
  });

  it('should validate an array of patches', () => {
    const mockPatches = [
      { ...blank(), name: null },
      { ...blank(), configs: [] },
      { ...blank(), modules: null }
    ];

    const result = validateData(mockPatches);

    expect(result.length).toBe(3);

    // All patches should be valid
    result.forEach(patch => {
      expect(isPatch(patch)).toBe(true);
      expect(typeof patch.name).toBe('string');
      expect(Array.isArray(patch.configs)).toBe(true);
      expect(patch.configs.length).toBeGreaterThan(0);
      expect(Array.isArray(patch.modules)).toBe(true);
    });
  });

  it('should fix null or undefined config name', () => {
    const mockPatch = {
      ...blank(),
      name: 'Test Patch',
      configs: [
        { name: null, parameters: {} },
        { name: undefined, parameters: {} },
        { name: '', parameters: {} }
      ]
    };

    const result = validateData([mockPatch]);

    expect(result[0].configs[0].name).toBeDefined();
    expect(result[0].configs[0].name).not.toBeNull();
    expect(result[0].configs[1].name).toBeDefined();
    expect(result[0].configs[2].name).not.toBe('');
  });

  it('should handle null configs in array', () => {
    const mockPatch = {
      ...blank(),
      name: 'Test Patch',
      configs: [null, undefined, {}]
    };

    const result = validateData([mockPatch]);

    expect(result[0].configs.length).toBe(3);
    expect(result[0].configs[0]).not.toBeNull();
    expect(result[0].configs[1]).not.toBeUndefined();
    expect(result[0].configs[2].name).toBeDefined();
    expect(result[0].configs[2].parameters).toBeDefined();
  });

  it('should fix configs that are not arrays', () => {
    const mockPatch = {
      ...blank(),
      name: 'Test Patch',
      configs: 'not an array' as any
    };

    const result = validateData([mockPatch]);

    expect(Array.isArray(result[0].configs)).toBe(true);
    expect(result[0].configs.length).toBeGreaterThan(0);
  });

  it('should validate all configs within patches', () => {
    const mockPatch = {
      ...blank(),
      name: 'Test Patch',
      configs: [
        { name: null, parameters: null },
        { name: '', parameters: {} },
        { name: 123, parameters: 'not an object' }
      ]
    };

    const result = validateData([mockPatch]);

    // All configs should have valid names
    result[0].configs.forEach((config, index) => {
      expect(typeof config.name).toBe('string');
      expect(config.name.length).toBeGreaterThan(0);
    });

    // All configs should have valid parameters objects
    result[0].configs.forEach((config) => {
      expect(typeof config.parameters).toBe('object');
    });
  });
});