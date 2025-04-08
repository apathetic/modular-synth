import { z } from 'zod';
import { state as blank } from '@/stores/patch';



const ModuleTypeEnum = z.enum(['MasterOut', 'Analyser', 'Clock', 'Compressor', 'Debugger', 'Delay', 'Drive', 'Env', 'Filter', 'LFO', 'Mixer', 'Node', 'NoteIn', 'OSC', 'Reverb', 'VCA', 'VCF']);
type moduleType = z.infer<typeof ModuleTypeEnum>;


const MasterOutSchema = z.object({
  id: z.literal(0),
  type: z.literal('MasterOut'),
  x: z.number(),
  y: z.number(),
});

const ModuleSchema = z.object({
  id: z.number(),
  type: ModuleTypeEnum,
  col: z.number(),
  row: z.number(),
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  h: z.number().optional()
}).or(MasterOutSchema);
type Module = z.infer<typeof ModuleSchema>;

/**
 * Type predicate to check if an object is a valid Module.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is a valid Module
 */
const isModule = (module: unknown): module is Module => ModuleSchema.safeParse(module).success;



const ConnectionSchema = z.object({
  id: z.number(),
  from: z.object({
    id: z.number(),
    port: z.number()
  }),
  to: z.object({
    id: z.number(),
    port: z.number()
  })
});
type Connection = z.infer<typeof ConnectionSchema>;

/**
 * Type predicate to check if an object is a valid Connection.
 * For type predicates, we do a direct property check rather than using Zod.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is a valid Connection
 */
const isConnection = (connection: unknown): connection is Connection => ConnectionSchema.safeParse(connection).success;



const ConfigSchema = z.object({
  name: z.string(),
  parameters: z.record(z.string(), z.union([z.string(), z.number()]))
});
/**
 * Type predicate to check if an object is a valid Config.
 * For type predicates, we do a direct property check rather than using Zod.
 *
 * @param obj - The object to check
 * @returns A type predicate indicating if the object is a valid Config
 */
const isConfig = (config: unknown): config is Config => ConfigSchema.safeParse(config).success;


const PatchSchema = z.object({
  id: z.string(),
  i: z.number(), // PatchKey
  name: z.string(),
  modules: z.array(ModuleSchema),
  connections: z.array(ConnectionSchema),
  configs: z.array(ConfigSchema)
});

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
    // needsWarning = true;
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
function validateData(patches: unknown): Patch[] {
  if (!patches || !Array.isArray(patches) || patches.length === 0) {
    throw new Error('Invalid patches array.');
  }

  return patches.map((patch) => isPatch(patch) ? patch : fixPatch(patch));
}



export {
  isPatch,
  isModule,
  isConnection,
  isConfig,
  fixPatch,
  validateData,


  PatchSchema,
  ModuleSchema,
  ConnectionSchema,
  ConfigSchema,
  // ParametersSchema
};
