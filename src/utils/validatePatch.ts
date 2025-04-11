import { state as blank } from '@/stores/patch';
import {
  ModuleSchema,
  ConnectionSchema,
  PresetSchema,
  PatchSchema,
} from '@/types/generated';

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
 * Uses Zod for validation with fallbacks to default values when necessary.
 *
 * @param patch - The patch to validate
 * @returns A valid patch with all required fields
 */
function fixPatch(patch: Partial<Patch>): Patch {
  const DEFAULT = blank();
  let result: Partial<Patch> = { ...patch };

  // Check and fix ID
  if (typeof result.id !== 'string') {
    console.warn('Patch missing valid id. Fixing...');
    result.id = DEFAULT.id;
  }

  // Check and fix name
  if (typeof result.name !== 'string') {
    console.warn('Patch missing valid name. Fixing...');
    result.name = DEFAULT.name;
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
function validateData(patches: unknown): Boolean/* Patch[] */ {
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
