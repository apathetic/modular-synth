import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateData, validatePatch, isPatch, isModule, isConnection, isConfig } from '../validatePatch';
import { state as blank } from '@/stores/patch';
import type { Patch, Module, Connection, Config } from '@/types';

// Mock console.warn
beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('isPatch', () => {
  it('should return true for a valid patch', () => {
    const patch = {
      id: 'test-id',
      name: 'Test Patch',
      modules: [],
      connections: [],
      configs: []
    };
    expect(isPatch(patch)).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(isPatch(null)).toBe(false);
    expect(isPatch(undefined)).toBe(false);
  });

  it('should return false for non-objects', () => {
    expect(isPatch('string')).toBe(false);
    expect(isPatch(123)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    expect(isPatch({})).toBe(false);
    expect(isPatch({ id: 'test-id' })).toBe(false);
    expect(isPatch({ id: 'test-id', name: 'Test' })).toBe(false);
  });
});

describe('isConnection', () => {
  it('should return true for a valid connection', () => {
    const connection: Connection = {
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

  it('should return false for non-objects', () => {
    expect(isConnection('string')).toBe(false);
    expect(isConnection(123)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    expect(isConnection({})).toBe(false);
    expect(isConnection({ id: 1 })).toBe(false);
    expect(isConnection({ id: 1, from: { id: 2, port: 0 } })).toBe(false);
    expect(isConnection({ id: 1, to: { id: 3, port: 1 } })).toBe(false);
    expect(isConnection({
      id: 1,
      from: { id: '2', port: 0 },  // id should be number
      to: { id: 3, port: 1 }
    })).toBe(false);
  });
});

describe('isConfig', () => {
  it('should return true for a valid config', () => {
    const config: Config = {
      name: 'Default',
      parameters: { frequency: 440 }
    };
    expect(isConfig(config)).toBe(true);
  });

  it('should return false for null or undefined', () => {
    expect(isConfig(null)).toBe(false);
    expect(isConfig(undefined)).toBe(false);
  });

  it('should return false for non-objects', () => {
    expect(isConfig('string')).toBe(false);
    expect(isConfig(123)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    expect(isConfig({})).toBe(false);
    expect(isConfig({ name: 'Default' })).toBe(false);
    expect(isConfig({ parameters: {} })).toBe(false);
    expect(isConfig({ name: 123, parameters: {} })).toBe(false); // name should be string
  });
});

describe('validatePatch', () => {
  it('should return a default patch if given null or undefined', () => {
    const defaultPatch = blank();
    expect(validatePatch(undefined)).toEqual(expect.objectContaining({
      id: expect.any(String),
      name: expect.any(String),
      modules: expect.any(Array),
      connections: expect.any(Array),
      configs: expect.any(Array)
    }));
  });

  it('should fix a patch missing name or id', () => {
    const patch: Partial<Patch> = {
      modules: [],
      connections: [],
      configs: []
    };
    const result = validatePatch(patch);
    expect(result.name).toBeTruthy();
    expect(result.id).toBeTruthy();
  });

  it('should ensure configs is initialized', () => {
    const patch: Partial<Patch> = {
      id: 'test',
      name: 'Test Patch',
      modules: [],
      connections: []
    };
    const result = validatePatch(patch);
    expect(Array.isArray(result.configs)).toBe(true);
    expect(result.configs.length).toBeGreaterThan(0);
  });

  it('should ensure modules is initialized', () => {
    const patch: Partial<Patch> = {
      id: 'test',
      name: 'Test Patch',
      configs: [],
      connections: []
    };
    const result = validatePatch(patch);
    expect(Array.isArray(result.modules)).toBe(true);
  });

  it('should ensure connections is initialized', () => {
    const patch: Partial<Patch> = {
      id: 'test',
      name: 'Test Patch',
      configs: [],
      modules: []
    };
    const result = validatePatch(patch);
    expect(Array.isArray(result.connections)).toBe(true);
  });

  it('should validate each module in the modules array', () => {
    const patch: Partial<Patch> = {
      id: 'test',
      name: 'Test Patch',
      modules: [{ id: 1 }] as any[],
      connections: [],
      configs: []
    };
    const result = validatePatch(patch);
    expect(result.modules[0]).toEqual(expect.objectContaining({
      id: 1,
      type: expect.any(String),
      x: expect.any(Number),
      y: expect.any(Number),
      col: expect.any(Number),
      row: expect.any(Number)
    }));
  });

  it('should validate each connection in the connections array', () => {
    const patch: Partial<Patch> = {
      id: 'test',
      name: 'Test Patch',
      modules: [],
      connections: [{ id: 1 }] as any[],
      configs: []
    };
    const result = validatePatch(patch);
    expect(result.connections[0]).toEqual(expect.objectContaining({
      id: 1,
      from: expect.objectContaining({
        id: expect.any(Number),
        port: expect.any(Number)
      }),
      to: expect.objectContaining({
        id: expect.any(Number),
        port: expect.any(Number)
      })
    }));
  });

  it('should validate each config in the configs array', () => {
    const patch: Partial<Patch> = {
      id: 'test',
      name: 'Test Patch',
      modules: [],
      connections: [],
      configs: [{ }] as any[]
    };
    const result = validatePatch(patch);
    expect(result.configs[0]).toEqual(expect.objectContaining({
      name: expect.any(String),
      parameters: expect.any(Object)
    }));
  });
});

describe('validateData', () => {
  it('should return an array with a default patch if given null or undefined', () => {
    expect(validateData(null)).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        modules: expect.any(Array),
        connections: expect.any(Array),
        configs: expect.any(Array)
      })
    ]);
    expect(validateData(undefined)).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        modules: expect.any(Array),
        connections: expect.any(Array),
        configs: expect.any(Array)
      })
    ]);
  });

  it('should return an array with a default patch if given an empty array', () => {
    expect(validateData([])).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        modules: expect.any(Array),
        connections: expect.any(Array),
        configs: expect.any(Array)
      })
    ]);
  });

  it('should return an array with a default patch if given a non-array', () => {
    expect(validateData('not an array')).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        modules: expect.any(Array),
        connections: expect.any(Array),
        configs: expect.any(Array)
      })
    ]);
  });

  it('should validate each patch in the array', () => {
    const patches = [
      { id: 'test1', name: 'Test 1' } as Partial<Patch>,
      { id: 'test2', name: 'Test 2' } as Partial<Patch>
    ];
    const result = validateData(patches);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(expect.objectContaining({
      id: 'test1',
      name: 'Test 1',
      modules: expect.any(Array),
      connections: expect.any(Array),
      configs: expect.any(Array)
    }));
    expect(result[1]).toEqual(expect.objectContaining({
      id: 'test2',
      name: 'Test 2',
      modules: expect.any(Array),
      connections: expect.any(Array),
      configs: expect.any(Array)
    }));
  });
});
