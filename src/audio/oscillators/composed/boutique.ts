import { context } from '../..';
import type { Inlet, Outlet, SynthModule } from '~/types/audio';
import { MultiWave } from '../multiWave';
import { Pulse } from '../pulse';

/**
 * Boutique — complex-timbre multiwave VCO with an internal wave folder and a
 * sub-oscillator. Based loosely on the Reaktor Primary "Boutique" oscillator.
 * Hard-sync is intentionally omitted in this phase.
 *
 * Signal flow
 * -----------
 *
 *     MultiWave ──► driveIn ──► folder ──► foldLevel ─┐
 *                                                     ├──► mixer ─► out
 *     Pulse(sub) ─► subLevel ─────────────────────────┘
 *
 *     pitch ──► main.frequency, sub.frequency (sub is at pitch / 2)
 *     fm    ──► fmDepth ──► main.frequency, sub.frequency
 *     modA  ──► modADepth ──► driveIn.gain   (wave-fold amount)
 *     modB  ──► modBDepth ──► main.width     (width for the pulse lane)
 *
 * Wave folding
 * ------------
 *
 * `folder` is a WaveShaperNode with a fixed curve containing several zero
 * crossings. The pre-stage `driveIn` gain determines how much of that curve
 * the signal traverses on each oscillation: low drive samples only the
 * linear centre (close to pass-through), high drive swings through the full
 * curve and introduces multiple fold-back reflections — classic West-Coast
 * complex-timbre territory.
 *
 * Sub-oscillator
 * --------------
 *
 * `sub` is a Pulse at 50% duty tuned one octave below `pitch`. `subLevel`
 * controls how much of it reaches the output mix. It does not participate in
 * FM other than via the shared pitch offset.
 */

export type BoutiqueOptions = {
  frequency?: number;
  detune?: number;
  /** Which main lane to play. 0 sine, 1 saw, 2 triangle, 3 pulse. */
  sel?: 0 | 1 | 2 | 3;
  /** Pulse-lane width (-1..1). Only audible when sel === 3. */
  width?: number;
  /** Drive amount for the wave folder. 0..1. Defaults to 0 (pass-through). */
  fold?: number;
  /** Sub-oscillator mix level. 0..1. Defaults to 0. */
  sub?: number;
  fm?: number;
  modA?: number;
  modB?: number;
};

// A fixed fold curve with five zero crossings. Drive (pre-gain) determines
// which range of inputs the signal actually traverses.
const FOLD_SAMPLES = 1024;
const FOLD_CYCLES  = 3; // number of folds visible across input range

function buildFoldCurve(): Float32Array {
  const c = new Float32Array(FOLD_SAMPLES);
  for (let i = 0; i < FOLD_SAMPLES; i++) {
    const x = (i / (FOLD_SAMPLES - 1)) * 2 - 1; // -1 .. 1
    c[i] = Math.sin(Math.PI * x * FOLD_CYCLES);
  }
  return c;
}

export class Boutique implements SynthModule {
  private main: MultiWave;
  private subOsc: Pulse;

  private driveIn: GainNode;    // pre-fold gain (knob + modA CV)
  private folder: WaveShaperNode;
  private foldLevel: GainNode;  // post-fold makeup gain
  private subLevel: GainNode;

  private mixer: GainNode;
  private ampNode: GainNode;

  private fmDepth:   GainNode;
  private modADepth: GainNode;
  private modBDepth: GainNode;

  private _destroyed = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(opts: BoutiqueOptions = {}) {
    const {
      frequency = 440,
      detune    = 0,
      sel       = 0,
      width     = 0,
      fold      = 0,
      sub       = 0,
      fm        = 200,
      modA      = 1,
      modB      = 1,
    } = opts;

    this.main = new MultiWave({ frequency, detune, sel, width });
    // Sub runs one octave below; we follow pitch changes in `setPitch`.
    this.subOsc = new Pulse({ frequency: frequency / 2, detune, width: 0 });

    // Wave-fold chain. `driveIn.gain` is the base drive amount; Mod A adds
    // audio-rate on top so you can sweep fold via an LFO/env.
    this.driveIn = context.createGain();
    this.driveIn.gain.value = baseDrive(fold);

    this.folder = context.createWaveShaper();
    this.folder.curve = buildFoldCurve();
    this.folder.oversample = '2x';

    this.foldLevel = context.createGain();
    this.foldLevel.gain.value = 1;

    const mainOut = this.main.outlets[0].audio;
    if (mainOut) mainOut.connect(this.driveIn);
    this.driveIn.connect(this.folder);
    this.folder.connect(this.foldLevel);

    // Sub chain.
    this.subLevel = context.createGain();
    this.subLevel.gain.value = sub;
    const subOut = this.subOsc.outlets[0].audio;
    if (subOut) subOut.connect(this.subLevel);

    // Output mix.
    this.mixer = context.createGain();
    this.mixer.gain.value = 0.5; // headroom — folder + sub can peak together
    this.foldLevel.connect(this.mixer);
    this.subLevel.connect(this.mixer);

    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;
    this.mixer.connect(this.ampNode);

    // Modulation chain gains.
    this.fmDepth   = context.createGain();
    this.modADepth = context.createGain();
    this.modBDepth = context.createGain();
    this.fmDepth.gain.value   = fm;
    this.modADepth.gain.value = modA;
    this.modBDepth.gain.value = modB;

    this.fmDepth.connect(this.main.frequency);
    this.fmDepth.connect(this.subOsc.frequency);

    // Mod A drives the fold amount.
    this.modADepth.connect(this.driveIn.gain);
    // Mod B drives the main pulse lane's width.
    this.modBDepth.connect(this.main.width);

    this.inlets = [
      {
        label: 'pitch',
        desc:  'Base frequency in Hz. Sub oscillator tracks at pitch / 2.',
        data:  (v) => this.setPitch(v as number),
      },
      {
        label: 'fm',
        desc:  'Audio-rate frequency modulation across both cores. Depth via the fm knob.',
        audio: this.fmDepth,
      },
      {
        label: 'modA',
        desc:  'Audio-rate mod into the wave-folder drive. Depth via the modA knob.',
        audio: this.modADepth,
      },
      {
        label: 'modB',
        desc:  'Audio-rate mod into the main pulse width. Depth via the modB knob.',
        audio: this.modBDepth,
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.ampNode },
    ];
  }

  // Tone-parallel surface

  get frequency(): AudioParam { return this.main.frequency; }
  get detune(): AudioParam    { return this.main.detune; }

  get sel(): 0 | 1 | 2 | 3 { return this.main.sel; }
  set sel(v: 0 | 1 | 2 | 3) { this.main.sel = v; }

  get width(): AudioParam { return this.main.width; }

  /** Base wave-fold drive (0..1). Mod A sums on top audio-rate. */
  get fold(): number { return this.driveIn.gain.value; }
  set fold(v: number) {
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    this.driveIn.gain.cancelScheduledValues(now);
    this.driveIn.gain.linearRampToValueAtTime(baseDrive(v), rampEnd);
  }

  /** Sub-oscillator mix level (0..1). */
  get sub(): number { return this.subLevel.gain.value; }
  set sub(v: number) {
    const level = Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    this.subLevel.gain.cancelScheduledValues(now);
    this.subLevel.gain.linearRampToValueAtTime(level, rampEnd);
  }

  get fm(): AudioParam   { return this.fmDepth.gain; }
  get modA(): AudioParam { return this.modADepth.gain; }
  get modB(): AudioParam { return this.modBDepth.gain; }

  start(time?: number): void {
    this.main.start?.(time);
    this.subOsc.start?.(time);
  }

  stop(time?: number): void {
    this.main.stop?.(time);
    this.subOsc.stop?.(time);
  }

  dispose(): void { this.destroy(); }

  // SynthModule contract

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;

    this.main.destroy();
    this.subOsc.destroy();

    this.driveIn.disconnect();
    this.folder.disconnect();
    this.foldLevel.disconnect();
    this.subLevel.disconnect();
    this.mixer.disconnect();
    this.ampNode.disconnect();

    this.fmDepth.disconnect();
    this.modADepth.disconnect();
    this.modBDepth.disconnect();
  }

  private setPitch(hz: number): void {
    if (!Number.isFinite(hz) || hz < 1) return;
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    this.main.frequency.cancelScheduledValues(now);
    this.main.frequency.linearRampToValueAtTime(hz, rampEnd);
    this.subOsc.frequency.cancelScheduledValues(now);
    this.subOsc.frequency.linearRampToValueAtTime(hz / 2, rampEnd);
  }
}

/**
 * Map a user-facing fold knob (0..1) to an internal drive multiplier. At 0
 * the signal passes through near-linearly (center of the fold curve); at 1
 * it swings across the full curve range, triggering all folds.
 */
function baseDrive(fold: number): number {
  const f = Math.max(0, Math.min(1, Number.isFinite(fold) ? fold : 0));
  return 0.1 + f * 0.9;
}
