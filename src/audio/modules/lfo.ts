import { context } from '..';
import type { Inlet, Outlet, SynthModule } from '~/types/audio';

export type LFOWaveform = 'sine' | 'triangle' | 'shark' | 'saw' | 'square' | 'random';

export type LFOOptions = {
  rate?: number;
  waveform?: LFOWaveform;
  shape?: number; // -100 to 100
};

// Create a generic random buffer for the S&H style 'random' wave.
// 60 seconds long. At rate=1Hz it outputs 1 random value per second.
let randomBuffer: AudioBuffer | null = null;
function getRandomBuffer(): AudioBuffer {
  if (randomBuffer) return randomBuffer;
  const sampleRate = context.sampleRate;
  randomBuffer = context.createBuffer(1, sampleRate * 60, sampleRate);
  const data = randomBuffer.getChannelData(0);
  for (let i = 0; i < 60; i++) {
    const val = (Math.random() * 2) - 1; // -1 to +1
    for (let j = 0; j < sampleRate; j++) {
      data[i * sampleRate + j] = val;
    }
  }
  return randomBuffer;
}

// Generate an approximation for the sharktooth wave
let sharkWave: PeriodicWave | null = null;
function getSharkWave(): PeriodicWave {
  if (sharkWave) return sharkWave;
  const N = 32;
  const real = new Float32Array(N);
  const imag = new Float32Array(N);
  for (let n = 1; n < N; n++) {
    const saw = 1 / n;
    const tri = ((n - 1) / 2 % 2 === 0 ? 1 : -1) * (1 / (n * n));
    imag[n] = (n % 2 !== 0) ? tri : saw;
  }
  sharkWave = context.createPeriodicWave(real, imag, { disableNormalization: false });
  return sharkWave;
}

export class LFO implements SynthModule {
  private _rate: number;
  private _waveform: LFOWaveform;
  private _shape: number;

  private activeNode: OscillatorNode | AudioBufferSourceNode | null = null;
  private ampNode: GainNode;
  private rateParam: ConstantSourceNode;
  private modDepth: GainNode;

  private _started = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(opts: LFOOptions = {}) {
    this._rate = opts.rate ?? 2;
    this._waveform = opts.waveform ?? 'triangle';
    this._shape = opts.shape ?? 0;

    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;

    // Use a ConstantSourceNode to represent the base rate, so we can modulate it easily.
    this.rateParam = context.createConstantSource();
    this.rateParam.offset.value = this._rate;
    this.rateParam.start();

    // Mod depth attenuverter for the 'mod' inlet
    this.modDepth = context.createGain();
    this.modDepth.gain.value = 50; // default 50Hz mod depth for incoming -1..1 signal
    this.modDepth.connect(this.rateParam.offset);

    this.inlets = [
      {
        label: 'reset',
        desc: 'Reset the LFO phase',
        data: (v) => {
          if (v === 1) this.reset();
        }
      },
      {
        label: 'mod',
        desc: 'Frequency modulation inlet',
        audio: this.modDepth
      }
    ];

    this.outlets = [
      { label: 'out', audio: this.ampNode }
    ];

    this.start();
  }

  get rate(): number { return this._rate; }
  set rate(v: number) {
    this._rate = v;
    const now = context.currentTime;
    this.rateParam.offset.cancelScheduledValues(now);
    this.rateParam.offset.linearRampToValueAtTime(v, now + 0.01);
  }

  get waveform(): LFOWaveform { return this._waveform; }
  set waveform(w: LFOWaveform) {
    if (this._waveform === w) return;
    this._waveform = w;
    this.rebuildNode();
  }

  get shape(): number { return this._shape; }
  set shape(v: number) {
    this._shape = v;
    // Currently acts as a dummy sink for the UI knob, can be mapped to pulse width or morph later.
  }

  start(time?: number): void {
    if (this._started) return;
    this._started = true;
    this.rebuildNode(time);
  }

  stop(time?: number): void {
    if (!this._started) return;
    this._started = false;
    if (this.activeNode) {
      this.activeNode.stop(time);
      this.activeNode.disconnect();
      this.activeNode = null;
    }
  }

  reset(): void {
    if (!this._started) return;
    this.rebuildNode();
  }

  dispose(): void {
    this.destroy();
  }

  destroy(): void {
    this.stop();
    try { this.rateParam.stop(); } catch (e) { /* ignore */console.log(e); }
    this.rateParam.disconnect();
    this.modDepth.disconnect();
    this.ampNode.disconnect();
  }

  private rebuildNode(time?: number): void {
    if (!this._started) return;

    const t = time ?? context.currentTime;

    if (this.activeNode) {
      // AudioBufferSourceNode and OscillatorNode can only be stopped once
      try { this.activeNode.stop(t); } catch (e) { /* ignore */console.log(e); }

      // Disconnect so it can be garbage collected
      // We wrap in timeout or just disconnect immediately. It might cause a small click
      // but it's an LFO, so it's less noticeable.
      this.activeNode.disconnect();
    }

    if (this._waveform === 'random') {
      const src = context.createBufferSource();
      src.buffer = getRandomBuffer();
      src.loop = true;
      // Map the rate to playbackRate. playbackRate 1 = 1 step per sec.
      this.rateParam.connect(src.playbackRate);
      src.connect(this.ampNode);
      src.start(t);
      this.activeNode = src;
    } else {
      const src = context.createOscillator();

      if (this._waveform === 'shark') {
        src.setPeriodicWave(getSharkWave());
      } else {
        const typeMap: Record<string, OscillatorType> = {
          'sine': 'sine',
          'triangle': 'triangle',
          'saw': 'sawtooth',
          'square': 'square'
        };
        src.type = typeMap[this._waveform] || 'triangle';
      }

      this.rateParam.connect(src.frequency);
      src.connect(this.ampNode);
      src.start(t);
      this.activeNode = src;
    }
  }
}
