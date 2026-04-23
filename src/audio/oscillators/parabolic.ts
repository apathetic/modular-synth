import { context } from '..';
import { BasicOsc, type BasicOscOptions } from './shared';

export type ParabolicOptions = Omit<BasicOscOptions, 'type'> & {
  /**
   * Number of harmonics used to build the PeriodicWave. More = brighter and
   * closer to a true sawtooth-integral, fewer = rounder. Defaults to 32.
   */
  harmonics?: number;
};

const DEFAULT_HARMONICS = 32;

/**
 * "Parabolic" oscillator — a smoother alternative to triangle, built from a
 * `PeriodicWave` with 1/n² harmonic rolloff. Distinctly curvier than
 * triangle (which has 1/n² on odd harmonics only with sign alternation) and
 * much darker than sawtooth (1/n rolloff).
 *
 * Tone-parallel: similar in spirit to `Tone.Oscillator` with `partials` set
 * to a 1/n² array. We expose `partials` read-only because the coefficients
 * are derived from `harmonics`, not arbitrary.
 */
export class Parabolic extends BasicOsc {
  private readonly _harmonics: number;
  private readonly _partials: Float32Array;

  constructor(options: ParabolicOptions = {}) {
    const { harmonics = DEFAULT_HARMONICS, ...rest } = options;
    super(rest);
    this._harmonics = harmonics;
    this._partials = buildParabolicPartials(harmonics);
    // `real` stays 0 (pure sine-phase harmonics); `imag[n]` carries 1/n² for
    // n = 1..harmonics. `imag[0]` is the DC offset and stays 0.
    const real = new Float32Array(harmonics + 1);
    const imag = new Float32Array(harmonics + 1);
    for (let n = 1; n <= harmonics; n++) imag[n] = this._partials[n - 1];
    const wave = context.createPeriodicWave(real, imag, { disableNormalization: false });
    this.osc.setPeriodicWave(wave);
  }

  /** Read-only view of the harmonic coefficients used to build the wave. */
  get partials(): ReadonlyArray<number> {
    return Array.from(this._partials);
  }

  get harmonics(): number { return this._harmonics; }
}

/** Build `[1, 1/4, 1/9, 1/16, ...]` — 1/n² coefficients for n = 1..N. */
function buildParabolicPartials(n: number): Float32Array {
  const out = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const harmonic = k + 1;
    out[k] = 1 / (harmonic * harmonic);
  }
  return out;
}
