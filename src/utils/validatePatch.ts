import { state as blank } from '@/stores/patch';
import type { Patch, Config } from '@/types';

/**
 * Type predicate to check if an object is a valid Patch.
 * This allows TypeScript to narrow types based on the validation result.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is a valid Patch
 */
function isPatch(obj: any): obj is Patch {
  if (!obj || typeof obj !== 'object') return false;

  return (
    typeof obj.name === 'string' &&
    typeof obj.id === 'string' &&
    Array.isArray(obj.modules) &&
    Array.isArray(obj.connections) &&
    Array.isArray(obj.configs)
  );
}

/**
 * Validates and fixes a single patch object to ensure it has all required fields.
 *
 * @param patch - The patch to validate
 * @param index - The index of the patch in the array (for logging)
 * @returns A valid patch with all required fields
 */
function validatePatch(patch: Partial<Patch> | undefined): Patch {
  const DEFAULT = blank();

  if (!patch || typeof patch !== 'object') {
    console.warn('Patch is missing or undefined. Replacing with default.');
    return { ...DEFAULT };
  }

  const result = { ...patch } as Patch;

  if (!result.name) {
    console.warn('Patch "%s" missing name', patch.id);
    result.name = DEFAULT.name;
  }

  if (result.id === undefined) {
    console.warn('Patch "%s" missing id. Fixing...', result.name);
    result.id = DEFAULT.id; // note: should autogenerate a UUID, here
  }

  if (!result.configs) {
    console.warn('Patch "%s" missing configs. Fixing...', result.name);
    result.configs = [...DEFAULT.configs];
  } else if (!Array.isArray(result.configs) || result.configs.length === 0) {
    console.warn('Patch "%s" has invalid configs array. Fixing...', result.name);
    result.configs = [...DEFAULT.configs];
  }

  // Ensure at least one config always exists
  if (result.configs.length === 0) {
    console.warn('Patch "%s" has no configs. Adding default config...', result.name);
    result.configs.push({
      name: '<blank>',
      parameters: {}
    });
  }

  // Validate each config within the patch
  for (let i = 0; i < result.configs.length; i++) {
    result.configs[i] = validateConfig(result.configs[i], result.name, i);
  }

  if (!result.connections) {
    console.warn('Patch "%s" missing connections. Fixing...', result.name);
    result.connections = [...DEFAULT.connections];
  }

  if (!result.modules) {
    console.warn('Patch "%s" no modules. Fixing...', result.name);
    result.modules = [...DEFAULT.modules];
  }

  return result;
}

/**
 * Validates a single config object to ensure it has all required fields.
 *
 * @param config - The config to validate
 * @param patchName - The name of the containing patch (for logging)
 * @param index - The index of the config in the array
 * @returns A valid config with all required fields
 */
function validateConfig(config: Partial<Config> | null | undefined, patchName: string, index: number): Config {
  const DEFAULT = blank();
  const defaultConfig = DEFAULT.configs[0];

  if (!config) {
    console.warn('Patch "%s" has null config at index %d. Fixing...', patchName, index);
    return { ...defaultConfig };
  }

  const result = { ...config } as Config;

  if (!result.name || typeof result.name !== 'string') {
    console.warn('Patch "%s" config at index %d missing valid name. Fixing...', patchName, index);
    result.name = result.name || `<config ${index}>`;
  }

  if (!result.parameters || typeof result.parameters !== 'object') {
    console.warn('Patch "%s" missing parameters in "%s". Fixing...', patchName, result.name);
    result.parameters = { ...defaultConfig.parameters };
  }

  return result;
}

/**
 * This validates an array of Patch objects coming from the server, and
 * ensures that each object has all the required fields. This
 * is important because everywhere else in the App we assume that
 * these fields are present -- and Firebase does _not_ store empty
 * values / arrays, etc. All data validation happens here.
 *
 * This function should only be used when loading/saving patches,
 * not during normal runtime operations.
 *
 * @param patches - The array of patches to validate
 * @returns An array of validated patches
 */
function validateData(patches?: unknown): Patch[] {
  // If patches is null, undefined, or not an array, return a blank patch
  if (!patches || !Array.isArray(patches) || patches.length === 0) {
    return [blank()];
  }

  // Validate each patch
  return patches.map(validatePatch);
}


export {
  isPatch,
  validatePatch,
  validateData,
};
