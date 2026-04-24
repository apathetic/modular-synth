import { context } from '..';
import type { Inlet, Outlet, SynthModule } from '~/types/audio';

export type PulseOptions = {
  /** Initial frequency in Hz. Defaults to 440. */
  frequency?: number;
  /** Initial detune in cents. Defaults to 0. */
  detune?: number;
  /**
   * Initial pulse width in the range (-1..1). 0 gives a 50% duty cycle
   * square wave; positive values bias towards a narrower high phase.
   * Defaults to 0.
   */
  width?: number;
};

/**
 * Variable-width pulse oscillator.
 *
 * DSP approach: a sawtooth is DC-biased by `width`, then shaped by a
 * hard-thresholding `WaveShaperNode` into ±1. Shifting the DC bias moves
 * where the saw crosses 0, which directly changes the duty cycle. This is
 * the technique from
 * https://github.com/pendragon-andyh/WebAudio-PulseOscillator and is also
 * how `Tone.PulseOscillator` works.
 *
 *     saw ───┐
 *            ├──► sum ──► waveshaper ──► amp ──► out
 *     width ─┘  (ConstantSource as DC)
 *
 * Tone-parallel API: `frequency`, `detune`, `width` AudioParams;
 * `start`/`stop`/`dispose`.
 */
export class Pulse implements SynthModule {
  private saw: OscillatorNode;
  private widthNode: ConstantSourceNode;
  private sum: GainNode;
  private shaper: WaveShaperNode;
  private ampNode: GainNode;
  private _started = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(options: PulseOptions = {}) {
    const { frequency = 440, detune = 0, width = 0 } = options;

    this.saw = context.createOscillator();
    this.saw.type = 'sawtooth';
    this.saw.frequency.value = frequency;
    this.saw.detune.value = detune;

    this.widthNode = context.createConstantSource();
    this.widthNode.offset.value = width;

    this.sum = context.createGain();
    this.sum.gain.value = 1;

    this.shaper = context.createWaveShaper();
    this.shaper.curve = buildPulseCurve();

    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;

    this.saw.connect(this.sum);
    this.widthNode.connect(this.sum);
    this.sum.connect(this.shaper);
    this.shaper.connect(this.ampNode);

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
      {
        label: 'width',
        desc: 'Pulse width bias (-1..1). 0 = 50% duty.',
        audio: this.widthNode.offset,
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.ampNode },
    ];

    this.start();
  }

  // Tone-parallel DSP API

  get frequency(): AudioParam { return this.saw.frequency; }
  get detune(): AudioParam { return this.saw.detune; }
  get width(): AudioParam { return this.widthNode.offset; }

  start(time?: number): void {
    if (this._started) return;
    const t = time ?? 0;
    this.saw.start(t);
    this.widthNode.start(t);
    this._started = true;
  }

  stop(time?: number): void {
    if (!this._started) return;
    const t = time ?? 0;
    this.saw.stop(t);
    this.widthNode.stop(t);
    this._started = false;
  }

  dispose(): void { this.destroy(); }

  destroy(): void {
    try { this.stop(); } catch { /* already stopped */ }
    this.saw.disconnect();
    this.widthNode.disconnect();
    this.sum.disconnect();
    this.shaper.disconnect();
    this.ampNode.disconnect();
  }

  private setPitch(hz: number): void {
    if (!Number.isFinite(hz) || hz < 1) return;
    const now = context.currentTime;
    this.saw.frequency.cancelScheduledValues(now);
    this.saw.frequency.linearRampToValueAtTime(hz, now + 0.01);
  }
}

/**
 * Step function centred at input 0: maps (-∞, 0) → -1 and [0, +∞) → +1. The
 * 256-sample resolution is arbitrary but matches the original PWM
 * implementation and is more than enough — the curve is piecewise-constant.
 */
function buildPulseCurve(): Float32Array {
  const curve = new Float32Array(256);
  for (let i = 0; i < 128; i++) {
    curve[i] = -1;
    curve[i + 128] = 1;
  }
  return curve;
}
