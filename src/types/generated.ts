import { z } from 'zod';

export const ModuleTypeEnum = z.enum(['Analyser', 'Clock', 'Compressor', 'Debugger', 'Delay', 'Drive', 'Env', 'Filter', 'LFO', 'Mixer', 'Node', 'NoteIn', 'OSC', 'Reverb', 'VCA', 'VCF']);


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


export const PresetSchema = z.object({
  name: z.string(),
  parameters: z.record(z.string(), z.union([z.string(), z.number()]))
});


export const PatchSchema = z.object({
  id: z.string(),
  i: z.number(), // PatchKey
  loaded: z.boolean(),
  name: z.string(),
  modules: z.array(z.union([ModuleSchema, MasterOutSchema])),
  connections: z.array(ConnectionSchema),
  presets: z.array(PresetSchema).nonempty()
});

declare global {
  type moduleType = z.infer<typeof ModuleTypeEnum>;
  type Module = z.infer<typeof ModuleSchema>;
  type MasterOut = z.infer<typeof MasterOutSchema>;
  type Connection = z.infer<typeof ConnectionSchema>;
  type Preset = z.infer<typeof PresetSchema>;
  type Patch = z.infer<typeof PatchSchema>;
  type parameterLabel = `${number}-${string}`;
  // type Parameters = Record<parameterLabel, string | number>;
}


export {
  type moduleType,
  type Module,
  type MasterOut,
  type Connection,
  type Preset,
  type Patch,
//  parameterLabel
}
