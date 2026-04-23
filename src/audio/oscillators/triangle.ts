import { BasicOsc, type BasicOscOptions } from './shared';

/**
 * Triangle oscillator — BasicOsc pinned to `type: 'triangle'`.
 * Softer harmonic content than Saw, sharper than Sine.
 */
export class Triangle extends BasicOsc {
  constructor(options: Omit<BasicOscOptions, 'type'> = {}) {
    super({ ...options, type: 'triangle' });
  }
}
