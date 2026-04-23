import { BasicOsc, type BasicOscOptions } from './shared';

/**
 * Sawtooth oscillator — BasicOsc pinned to `type: 'sawtooth'`.
 * Harmonic-rich, classic "buzzy" analogue tone.
 */
export class Saw extends BasicOsc {
  constructor(options: Omit<BasicOscOptions, 'type'> = {}) {
    super({ ...options, type: 'sawtooth' });
  }
}
