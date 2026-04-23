/**
 * Barrel re-exports for the "core" oscillator primitives.
 *
 * These classes are DSP-only building blocks — they are not registered with
 * the module system and have no Vue UI. Composed oscillators (Bento Box,
 * Boutique, Monark, Modern, Kodiak, West Coast) in `./composed/` wire these
 * primaries together and handle the UI-facing surface.
 */

export { BasicOsc, type BasicOscOptions } from './shared';
export { Sine, type SineOptions } from './sine';
export { Cosine } from './cosine';
export { Saw } from './saw';
export { Triangle } from './triangle';
export { Pulse, type PulseOptions } from './pulse';
export { MultiWave, type MultiWaveOptions } from './multiWave';
export { Parabolic, type ParabolicOptions } from './parabolic';
export { Noise, type NoiseOptions, type NoiseColor } from './noise';
export { Wavetable, type WavetableOptions } from './wavetable';
export {
  analogueSweep,
  oddBloom,
  builtInTables,
  type Wavetable as WavetableTable,
  type WaveSlot,
  type BuiltInTableName,
} from './tables';

// Composed Reaktor-style oscillators (Phase B).
export * from './composed';
