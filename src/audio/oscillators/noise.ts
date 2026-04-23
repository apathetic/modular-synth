import { context } from '..';
import type { Inlet, Outlet, SynthModule } from '@/types/audio';

export type NoiseColor = 'white' | 'pink' | 'brown';

export type NoiseOptions = {
  /** Noise colour. Defaults to 'white'. Matches `Tone.Noise.type`. */
  type?: NoiseColor;
  /**
   * Buffer length in seconds. Longer buffers hide the loop point at the cost
   * of a one-time allocation. Defaults to 4 seconds.
   */
  length?: number;
};

/**
 * Looping-buffer noise source. Three colour choices — white (flat spectrum),
 * pink (1/f), brown (1/f²) — all pre-rendered offline into an
 * `AudioBuffer` and played back through an `AudioBufferSourceNode`. No
 * AudioWorklet, no runtime DSP: the colour is baked into the buffer.
 *
 * Pink uses Paul Kellet's classic biquad-cascade approximation. Brown is
 * an integrated white-noise (leaky integrator, 0.02 coupling). Both are
 * accurate enough for musical use; replacing them with AudioWorklet
 * implementations later is a drop-in change.
 *
 * Tone-parallel: matches `Tone.Noise`'s surface — `type` setter,
 * `start` / `stop` / `dispose`. No `frequency`/`detune` (noise is aperiodic).
 */
export class Noise implements SynthModule {
  private source: AudioBufferSourceNode;
  private ampNode: GainNode;
  private _type: NoiseColor;
  private _length: number;
  private _started = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(options: NoiseOptions = {}) {
    this._type = options.type ?? 'white';
    this._length = options.length ?? 4;

    this.source = context.createBufferSource();
    this.source.buffer = buildNoiseBuffer(this._type, this._length);
    this.source.loop = true;

    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;

    this.source.connect(this.ampNode);

    this.inlets = [
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

  // Tone-parallel DSP API

  get type(): NoiseColor { return this._type; }
  set type(next: NoiseColor) {
    if (next === this._type) return;
    // Changing colour requires a fresh buffer and — because AudioBufferSource
    // can't be restarted — a brand new source node. Swap it under the amp
    // stage while preserving downstream connections.
    const wasStarted = this._started;
    try { this.source.stop(); } catch { /* already stopped */ }
    this.source.disconnect();
    this._type = next;
    this.source = context.createBufferSource();
    this.source.buffer = buildNoiseBuffer(this._type, this._length);
    this.source.loop = true;
    this.source.connect(this.ampNode);
    this._started = false;
    if (wasStarted) this.start();
  }

  start(time?: number): void {
    if (this._started) return;
    this.source.start(time ?? 0);
    this._started = true;
  }

  stop(time?: number): void {
    if (!this._started) return;
    this.source.stop(time ?? 0);
    this._started = false;
  }

  dispose(): void { this.destroy(); }

  destroy(): void {
    try { this.stop(); } catch { /* already stopped */ }
    this.source.disconnect();
    this.ampNode.disconnect();
  }
}

function buildNoiseBuffer(type: NoiseColor, seconds: number): AudioBuffer {
  const sampleRate = context.sampleRate;
  const length = Math.max(1, Math.floor(seconds * sampleRate));
  const buffer = context.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  switch (type) {
    case 'white': fillWhite(data); break;
    case 'pink':  fillPink(data);  break;
    case 'brown': fillBrown(data); break;
  }
  return buffer;
}

function fillWhite(out: Float32Array): void {
  for (let i = 0; i < out.length; i++) out[i] = Math.random() * 2 - 1;
}

/**
 * Paul Kellet's pink-noise approximation. Seven parallel first-order IIR
 * filters with empirically-tuned coefficients. Produces a spectrum close to
 * -3 dB/octave across the audible range; not a precise 1/f but more than
 * enough for synthesis.
 *
 * Reference: https://www.firstpr.com.au/dsp/pink-noise/
 */
function fillPink(out: Float32Array): void {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < out.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
}

/**
 * Brown (red) noise via leaky integrator of white noise. The 0.02 coupling
 * keeps values bounded; the 3.5 gain normalises the output to roughly
 * ±1 amplitude across typical runs.
 */
function fillBrown(out: Float32Array): void {
  let last = 0;
  for (let i = 0; i < out.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    out[i] = last * 3.5;
  }
}
