import { state as blank } from '~/stores/patch';
import {
  ModuleSchema,
  ConnectionSchema,
  PresetSchema,
  PatchSchema,
} from '~/types/generated';

/**
 * Type predicate to check if an object is a valid Module.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is a valid Module
 */
const isModule = (module: unknown): module is Module => ModuleSchema.safeParse(module).success;

/**
 * Type predicate to check if an object is a valid Connection.
 * For type predicates, we do a direct property check rather than using Zod.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is a valid Connection
 */
const isConnection = (connection: unknown): connection is Connection => ConnectionSchema.safeParse(connection).success;

/**
 * Type predicate to check if an object is a valid Preset.
 * For type predicates, we do a direct property check rather than using Zod.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is a valid Preset
 */
const isPreset = (preset: unknown): preset is Preset => PresetSchema.safeParse(preset).success;

/**
 * Type predicate to check if an object is a valid Patch.
 * For type predicates, we use a direct property check with a more lenient approach.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is a valid Patch
 */
const isPatch = (patch: unknown): patch is Patch => {
  const result = PatchSchema.safeParse(patch);
  if (!result.success) {
    console.error('Invalid patch:', result.error);
  }
  return result.success;
};





/////


/**
 * Validates and fixes a single patch object to ensure it has all required fields.
 * Repairs recoverable fields in place; throws only when the result still fails
 * schema validation after repair. Callers should treat a throw as "substitute
 * a fresh default".
 *
 * @param patch - The patch to validate
 * @returns A valid patch with all required fields
 */
function fixPatch(patch: Partial<Patch> | null | undefined): Patch {
  const DEFAULT = blank();

  if (!patch || typeof patch !== 'object') {
    console.warn('Patch is not an object. Using default.');
    return DEFAULT;
  }

  const result: Partial<Patch> = { ...patch };

  if (typeof result.id !== 'string') {
    console.warn('Patch missing valid id. Fixing...');
    result.id = DEFAULT.id;
  }

  if (typeof result.name !== 'string') {
    console.warn('Patch missing valid name. Fixing...');
    result.name = DEFAULT.name;
  }

  if (typeof result.i !== 'number' || !Number.isFinite(result.i)) {
    console.warn('Patch missing valid module counter (i). Fixing...');
    result.i = DEFAULT.i;
  }

  // `loaded` is a runtime flag; always start fresh.
  result.loaded = false;

  if (!Array.isArray(result.modules)) {
    console.warn('Patch modules missing/invalid. Fixing...');
    result.modules = DEFAULT.modules;
  } else {
    // Ensure MasterOut sentinel is present; drop entries that don't validate.
    const hasMasterOut = result.modules.some(
      (m): m is MasterOut => !!m && typeof m === 'object' && (m as MasterOut).id === 0
    );
    const cleanModules = result.modules.filter((m) =>
      (m && typeof m === 'object' && (m as MasterOut).id === 0) || isModule(m)
    );
    result.modules = hasMasterOut ? cleanModules : [...DEFAULT.modules, ...cleanModules];
  }

  if (!Array.isArray(result.connections)) {
    console.warn('Patch connections missing/invalid. Fixing...');
    result.connections = [];
  } else {
    result.connections = result.connections.filter(isConnection);
  }

  if (!Array.isArray(result.presets) || result.presets.length === 0) {
    console.warn('Patch presets missing/invalid. Fixing...');
    result.presets = DEFAULT.presets;
  } else {
    const cleanPresets = result.presets.filter(isPreset);
    result.presets = (cleanPresets.length > 0 ? cleanPresets : DEFAULT.presets) as Patch['presets'];
  }

  if (!isPatch(result)) {
    throw new Error('PATCH VALIDATION and subsequent fix failed.');
  }

  return result as Patch;
}

/**
 * This validates an array of Patch objects, ensuring that each has all the
 * required fields. This is important because everywhere else in the App we
 * assume that these fields are present.
 *
 * This function should only be used when loading/saving patches, not during
 * normal runtime operations.
 *
 * @param patches - The array of patches to validate
 * @returns An array of validated patches
 */
function validateData(patches: unknown): boolean/* Patch[] */ {
  if (!patches || !Array.isArray(patches) || patches.length === 0) {
    throw new Error('Invalid patches array.');
  }

  return patches.every((patch) => isPatch(patch));
  // return patches.map((patch) => isPatch(patch) ? patch : fixPatch(patch));
}

export {
  isPatch,
  isModule,
  isConnection,
  isPreset,
  fixPatch,
  validateData,
};
