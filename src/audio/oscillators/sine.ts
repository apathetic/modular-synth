import { context } from '..';
import { BasicOsc, type BasicOscOptions } from './shared';

export type SineOptions = Omit<BasicOscOptions, 'type'> & {
  /** Phase offset in radians. 0 = sine, π/2 = cosine. */
  phase?: number;
};

/**
 * Pure sine oscillator with optional phase offset. When `phase !== 0` the
 * oscillator runs a custom `PeriodicWave` — which is how we get a cosine
 * (phase = π/2) out of the same class.
 *
 * Tone-parallel: mirrors `Tone.Oscillator` with `type: 'sine'` and a
 * user-settable `phase`.
 */
export class Sine extends BasicOsc {
  private _phase: number;

  constructor(options: SineOptions = {}) {
    const { phase = 0, ...rest } = options;
    super({ ...rest, type: 'sine' });
    this._phase = 0;
    this.phase = phase; // triggers wave rebuild if non-zero
  }

  get phase(): number { return this._phase; }
  set phase(radians: number) {
    this._phase = radians;
    if (radians === 0) {
      this.osc.type = 'sine';
      return;
    }
    // sin(ωt + φ) = sin(ωt)cos(φ) + cos(ωt)sin(φ)
    // PeriodicWave real[n] = cosine coefficient for harmonic n,
    // imag[n] = sine coefficient for harmonic n. Only n=1 is populated.
    const real = new Float32Array([0, Math.sin(radians)]);
    const imag = new Float32Array([0, Math.cos(radians)]);
    const wave = context.createPeriodicWave(real, imag, { disableNormalization: false });
    this.osc.setPeriodicWave(wave);
  }
}
