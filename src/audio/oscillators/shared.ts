import { context } from '..';
import type { Inlet, Outlet, SynthModule } from '@/types/audio';

/**
 * Shared scaffolding for the "core" oscillator primitives. These classes are
 * DSP-only building blocks consumed by the composed Reaktor-style oscillators
 * in `./composed/` — they are not registered with the rack and have no Vue UI.
 *
 * Tone-parallel API
 * -----------------
 *
 * Every primary class surfaces Tone.js-style ergonomics so a future swap is a
 * per-class constructor-internals change:
 *
 *   - `frequency` / `detune` — AudioParams (automatable, a-rate).
 *   - `type`                 — setter where applicable.
 *   - `start(time?)` / `stop(time?)` / `dispose()` — lifecycle.
 *
 * `dispose()` is an alias for the `SynthModule.destroy()` contract our routing
 * layer expects. Both do the same thing.
 *
 * Inlet / outlet contract
 * -----------------------
 *
 * Every primary exposes a `pitch` data inlet (Hz, k-rate), an `amp` audio
 * inlet bound to an internal GainNode's `gain` AudioParam, and an `out` audio
 * outlet. Type-specific inlets (width, sel, index, ...) are layered on top by
 * individual subclasses.
 *
 * Note: `amp` is **additive** on top of an intrinsic gain of 1 — that's just
 * how WebAudio AudioParam routing works. Unpatched, the oscillator passes
 * through at unity; patched, the inlet's signal sums with 1. Composed
 * oscillators typically manage amplitude staging themselves and route around
 * this, so the primary-level behaviour is rarely user-visible.
 */

export type BasicOscOptions = {
  /** Initial frequency in Hz. Defaults to 440. */
  frequency?: number;
  /** Initial detune in cents. Defaults to 0. */
  detune?: number;
  /** Initial wave type. Defaults to 'sine'. Subclasses typically override. */
  type?: OscillatorType;
};

/**
 * Base class for WebAudio-native oscillator types (sine / saw / triangle /
 * square / custom PeriodicWave).
 *
 * Owns `OscillatorNode -> GainNode("amp") -> out`. The amp gain defaults to 1
 * so the oscillator is audible without any external gain staging.
 */
export class BasicOsc implements SynthModule {
  protected osc: OscillatorNode;
  protected ampNode: GainNode;
  private _started = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(options: BasicOscOptions = {}) {
    const { frequency = 440, detune = 0, type = 'sine' } = options;

    this.osc = context.createOscillator();
    this.osc.type = type;
    this.osc.frequency.value = frequency;
    this.osc.detune.value = detune;

    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;

    this.osc.connect(this.ampNode);

    this.inlets = [
      {
        label: 'pitch',
        desc: 'Base oscillator frequency in Hz (k-rate)',
        data: (v) => this.setPitch(v as number),
      },
      {
        label: 'amp',
        desc: 'Audio-rate amplitude control (additive on top of intrinsic 1)',
        audio: this.ampNode.gain,
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.ampNode },
    ];

    this.start();
  }

  // Tone-parallel DSP API surface

  get frequency(): AudioParam { return this.osc.frequency; }
  get detune(): AudioParam { return this.osc.detune; }

  get type(): OscillatorType { return this.osc.type; }
  set type(t: OscillatorType) { this.osc.type = t; }

  start(time?: number): void {
    if (this._started) return;
    this.osc.start(time ?? 0);
    this._started = true;
  }

  stop(time?: number): void {
    if (!this._started) return;
    this.osc.stop(time ?? 0);
    this._started = false;
  }

  /** Tone-style alias of {@link destroy}. */
  dispose(): void { this.destroy(); }

  // SynthModule contract

  destroy(): void {
    try { this.stop(); } catch { /* already stopped — safe to ignore */ }
    this.osc.disconnect();
    this.ampNode.disconnect();
  }

  /**
   * Smoothly ramps the oscillator frequency to `hz`. Short ramp (≈10ms) is
   * enough to avoid discontinuity clicks while remaining perceptually
   * instantaneous.
   */
  protected setPitch(hz: number): void {
    if (!Number.isFinite(hz) || hz < 1) return; // no DC, no NaN
    const now = context.currentTime;
    this.osc.frequency.cancelScheduledValues(now);
    this.osc.frequency.linearRampToValueAtTime(hz, now + 0.01);
  }
}
