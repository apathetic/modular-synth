import { describe, it, expect } from 'vitest';
import { simplePatch } from '~/synths/simple';

/*
  Guards the preset shape of `simplePatch`: parameters must be nested by
  numeric moduleId, and every keyed moduleId must correspond to a real
  module in the patch. If this test fails, `useParameter` will read/write
  values for phantom modules and saved presets will carry orphaned keys.
*/

describe('simplePatch preset defaults', () => {
  it('ships preset parameters in `parameters[moduleId][name]` shape', () => {
    const { modules, presets } = simplePatch();
    const ids = new Set(modules.map((m) => (m as Module).id));
    const params = presets[0]!.parameters;

    const moduleIdKeys = Object.keys(params);
    expect(moduleIdKeys.length).toBeGreaterThan(0);

    for (const key of moduleIdKeys) {
      expect(key).toMatch(/^\d+$/);
      expect(ids.has(Number(key))).toBe(true);

      const bucket = params[Number(key) as unknown as keyof typeof params];
      expect(typeof bucket).toBe('object');
      expect(bucket && Object.keys(bucket).length).toBeGreaterThan(0);
    }
  });
});
