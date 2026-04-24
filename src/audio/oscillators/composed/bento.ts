import { context } from '../..';
import type { Inlet, Outlet, SynthModule } from '~/types/audio';
import { Saw } from '../saw';
import { Pulse } from '../pulse';

/**
 * Bento Box — "the workhorse" composed oscillator.
 *
 * A classic saw + pulse VCO with an adjustable shape crossfade, linear FM,
 * pulse-width modulation (Mod A), and a post-stage VCA for amplitude
 * modulation (Mod B). Takes after the Reaktor Primary oscillator of the
 * same name. Hard-sync is intentionally omitted in this phase.
 *
 * Signal flow
 * -----------
 *
 *     Saw   ──► sawGate ─┐
 *                        ├──► mixer ──► vca ──► amp ──► out
 *     Pulse ──► pulseGate ┘                 ▲
 *                                           │
 *     pitch   ──► both osc.frequency        │
 *     fm      ──► fmDepth ──► both osc.frequency
 *     modA    ──► modADepth ──► pulse.width
 *     modB    ──► modBDepth ──► vca.gain
 *
 * Shape knob (0..1) crossfades between the saw lane (`1 - shape`) and the
 * pulse lane (`shape`). At 0.5 both contribute equally, giving the thick
 * PWM-bass-ish character Bento Box is known for.
 *
 * Knob / inlet wiring
 * -------------------
 *
 * Each of `fm`, `modA`, `modB` has both an audio inlet and a depth knob; the
 * knob IS the attenuverter for that inlet's incoming signal. Unpatched inlets
 * contribute 0 regardless of the knob.
 *
 * Tone-parallel surface is intentionally minimal here since Bento isn't a
 * drop-in for any Tone oscillator; we keep `frequency`, `detune`, `start`,
 * `stop`, and `dispose` for consistency with the core primitives.
 */

export type BentoOptions = {
  frequency?: number;
  detune?: number;
  /** 0 = pure saw, 1 = pure pulse, 0.5 = equal mix. Defaults to 0.5. */
  shape?: number;
  /** Pulse width bias -1..1. Defaults to 0 (50% duty). */
  width?: number;
  /** Base FM depth in Hz per unit input. Defaults to 200. */
  fm?: number;
  /** Base Mod A (PWM) depth. Defaults to 0.5. */
  modA?: number;
  /** Base Mod B (AM) depth. Defaults to 0.5. */
  modB?: number;
};

export class Bento implements SynthModule {
  private saw: Saw;
  private pulse: Pulse;

  private sawGate: GainNode;
  private pulseGate: GainNode;
  private mixer: GainNode;
  private vca: GainNode;
  private ampNode: GainNode;

  // Depth gains — knobs drive their `.gain.value`, and the corresponding
  // inlet audio is routed *through* them so the knob acts as an attenuverter.
  private fmDepth: GainNode;
  private modADepth: GainNode;
  private modBDepth: GainNode;

  private _shape: number;
  private _destroyed = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(opts: BentoOptions = {}) {
    const {
      frequency = 440,
      detune    = 0,
      shape     = 0.5,
      width     = 0,
      fm        = 200,
      modA      = 0.5,
      modB      = 0.5,
    } = opts;

    this.saw   = new Saw({ frequency, detune });
    this.pulse = new Pulse({ frequency, detune, width });

    // Per-lane gates for the saw↔pulse crossfade. Gate gains are set to the
    // shape split up front; `setShape` below ramps them for live knob moves.
    this.sawGate   = context.createGain();
    this.pulseGate = context.createGain();
    this.sawGate.gain.value   = 1 - shape;
    this.pulseGate.gain.value = shape;

    const sawOut   = this.saw.outlets[0].audio;
    const pulseOut = this.pulse.outlets[0].audio;
    if (sawOut)   sawOut.connect(this.sawGate);
    if (pulseOut) pulseOut.connect(this.pulseGate);

    this.mixer = context.createGain();
    this.mixer.gain.value = 0.5; // prevent clipping when both lanes sum to ±2
    this.sawGate.connect(this.mixer);
    this.pulseGate.connect(this.mixer);

    // VCA for Mod B (AM). Intrinsic gain of 1 so unpatched behaviour is
    // unity; Mod B adds to it audio-rate.
    this.vca = context.createGain();
    this.vca.gain.value = 1;
    this.mixer.connect(this.vca);

    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;
    this.vca.connect(this.ampNode);

    // Modulation chain gains. Each inlet runs through one of these, which the
    // corresponding knob mutates. Knob sets the *scaling* of incoming signal.
    this.fmDepth   = context.createGain();
    this.modADepth = context.createGain();
    this.modBDepth = context.createGain();
    this.fmDepth.gain.value   = fm;
    this.modADepth.gain.value = modA;
    this.modBDepth.gain.value = modB;

    // Fan FM out to both cores' frequency AudioParams. Linear-FM semantics:
    // 1 unit of FM signal times `fmDepth` = that many Hz of shift.
    this.fmDepth.connect(this.saw.frequency);
    this.fmDepth.connect(this.pulse.frequency);

    // Mod A → pulse width. Only affects the pulse lane; the saw lane is
    // unaffected but that's fine — PWM shaping through a saw/pulse crossfade
    // is the classic Bento move anyway.
    this.modADepth.connect(this.pulse.width);

    // Mod B → VCA gain (AM). The VCA gain AudioParam floats around 1; adding
    // a ±1 CV at depth 1 gives a full 0..2 gain swing.
    this.modBDepth.connect(this.vca.gain);

    this._shape = shape;

    this.inlets = [
      {
        label: 'pitch',
        desc:  'Base frequency in Hz (k-rate). Shared across both cores.',
        data:  (v) => this.setPitch(v as number),
      },
      {
        label: 'fm',
        desc:  'Audio-rate frequency modulation. Depth set by the fm knob.',
        audio: this.fmDepth,
      },
      {
        label: 'modA',
        desc:  'Audio-rate mod into pulse width. Depth set by the modA knob.',
        audio: this.modADepth,
      },
      {
        label: 'modB',
        desc:  'Audio-rate mod into the output VCA (AM). Depth set by the modB knob.',
        audio: this.modBDepth,
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.ampNode },
    ];
  }

  // Tone-parallel surface

  get frequency(): AudioParam { return this.saw.frequency; }
  get detune(): AudioParam    { return this.saw.detune; }

  get shape(): number { return this._shape; }
  set shape(v: number) { this.setShape(v); }

  get width(): AudioParam { return this.pulse.width; }

  get fm(): AudioParam   { return this.fmDepth.gain; }
  get modA(): AudioParam { return this.modADepth.gain; }
  get modB(): AudioParam { return this.modBDepth.gain; }

  start(time?: number): void {
    this.saw.start?.(time);
    this.pulse.start?.(time);
  }

  stop(time?: number): void {
    this.saw.stop?.(time);
    this.pulse.stop?.(time);
  }

  dispose(): void { this.destroy(); }

  // SynthModule contract

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;

    this.saw.destroy();
    this.pulse.destroy();

    this.sawGate.disconnect();
    this.pulseGate.disconnect();
    this.mixer.disconnect();
    this.vca.disconnect();
    this.ampNode.disconnect();

    this.fmDepth.disconnect();
    this.modADepth.disconnect();
    this.modBDepth.disconnect();
  }

  private setPitch(hz: number): void {
    if (!Number.isFinite(hz) || hz < 1) return;
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    this.saw.frequency.cancelScheduledValues(now);
    this.saw.frequency.linearRampToValueAtTime(hz, rampEnd);
    this.pulse.frequency.cancelScheduledValues(now);
    this.pulse.frequency.linearRampToValueAtTime(hz, rampEnd);
  }

  /**
   * Ramp the saw/pulse gates to the new split. Clamped 0..1 and short-ramped
   * (10ms) to avoid zipper noise when the UI drags the shape knob quickly.
   */
  private setShape(v: number): void {
    const s = Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
    if (s === this._shape) return;
    this._shape = s;
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    this.sawGate.gain.cancelScheduledValues(now);
    this.pulseGate.gain.cancelScheduledValues(now);
    this.sawGate.gain.linearRampToValueAtTime(1 - s, rampEnd);
    this.pulseGate.gain.linearRampToValueAtTime(s, rampEnd);
  }
}
