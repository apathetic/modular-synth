import { z } from 'zod';

// Export the module type enum and its inferred type
export const ModuleTypeEnum = z.enum(['Analyser', 'Clock', 'Compressor', 'Debugger', 'Delay', 'Drive', 'Env', 'Filter', 'LFO', 'Mixer', 'Node', 'NoteIn', 'OSC', 'Reverb', 'VCA', 'VCF']);
export type moduleType = z.infer<typeof ModuleTypeEnum>;


export const MasterOutSchema = z.object({
  id: z.literal(0),
  type: z.literal('MasterOut'),
  x: z.number(),
  y: z.number(),
});

export const ModuleSchema = z.object({
  id: z.number(),
  type: ModuleTypeEnum,
  col: z.number(),
  row: z.number(),
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  h: z.number().optional()
})
// .or(MasterOutSchema);


export const ConnectionSchema = z.object({
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


export const ConfigSchema = z.object({
  name: z.string(),
  parameters: z.record(z.string(), z.union([z.string(), z.number()]))
});


export const PatchSchema = z.object({
  id: z.string(),
  i: z.number(), // PatchKey
  loaded: z.boolean(),
  name: z.string(),
  modules: z.array(ModuleSchema),
  connections: z.array(ConnectionSchema),
  configs: z.array(ConfigSchema)
});
// export type Patch = z.infer<typeof PatchSchema>;

declare global {
  type moduleType = z.infer<typeof ModuleTypeEnum>;
  type Module = z.infer<typeof ModuleSchema>;
  type Connection = z.infer<typeof ConnectionSchema>;
  type Config = z.infer<typeof ConfigSchema>;
  type Patch = z.infer<typeof PatchSchema>;
  type parameterLabel = `${number}-${string}`;
  // type Parameters = Record<parameterLabel, string | number>;
}