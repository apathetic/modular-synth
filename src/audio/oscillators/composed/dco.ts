import { context } from '../..';
import type { Inlet, Outlet, SynthModule } from '~/types/audio';
import { Saw } from '../saw';
import { Pulse } from '../pulse';
import { BasicOsc } from '../shared';
import { Noise } from '../noise';

export type DCOOptions = {
  frequency?: number;
  detune?: number;
  sawLevel?: number;
  pulseLevel?: number;
  pulseWidth?: number;
  subLevel?: number;
  noiseLevel?: number;
};

/**
 * DCO (Digitally Controlled Oscillator) — A Roland Juno-style composite
 * oscillator.
 *
 * Instead of switching between waveforms, this module provides a mixer to
 * blend four parallel sources:
 *   - Sawtooth: Standard rich harmonic core.
 *   - Pulse: Variable-width pulse wave with PWM support.
 *   - Sub: A square wave fixed at one octave below (-1 oct) the primary.
 *   - Noise: A white noise source.
 *
 * Signal flow
 * -----------
 *
 *     Saw    ──► sawGain   ──┐
 *     Pulse  ──► pulseGain  ├──► mixer ──► amp ──► out
 *     Sub    ──► subGain    │
 *     Noise  ──► noiseGain  ┘
 *
 * All cores share a base `pitch` inlet. `pulse` specifically exposes its
 * `width` AudioParam for PWM.
 */
export class DCO implements SynthModule {
  private sawtooth: Saw;
  private pulse: Pulse;
  private sub: BasicOsc;
  private noise: Noise;

  private sawGain: GainNode;
  private pulseGain: GainNode;
  private subGain: GainNode;
  private noiseGain: GainNode;

  private mixer: GainNode;
  private ampNode: GainNode;

  private _destroyed = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(opts: DCOOptions = {}) {
    const {
      frequency = 440,
      detune = 0,
      sawLevel = 0.5,
      pulseLevel = 0.5,
      pulseWidth = 0,
      subLevel = 0,
      noiseLevel = 0,
    } = opts;

    // 1. Initialize core generators
    this.sawtooth = new Saw({ frequency, detune });
    this.pulse = new Pulse({ frequency, detune, width: pulseWidth });
    this.sub = new BasicOsc({ frequency: frequency / 2, detune, type: 'square' });
    this.noise = new Noise({ type: 'white' });

    // 2. Initialize mixer stages
    this.sawGain = context.createGain();
    this.pulseGain = context.createGain();
    this.subGain = context.createGain();
    this.noiseGain = context.createGain();

    this.sawGain.gain.value = sawLevel;
    this.pulseGain.gain.value = pulseLevel;
    this.subGain.gain.value = subLevel;
    this.noiseGain.gain.value = noiseLevel;

    // 3. Wiring
    const sawOut = this.sawtooth.outlets[0].audio;
    const pulseOut = this.pulse.outlets[0].audio;
    const subOut = this.sub.outlets[0].audio;
    const noiseOut = this.noise.outlets[0].audio;

    if (sawOut) sawOut.connect(this.sawGain);
    if (pulseOut) pulseOut.connect(this.pulseGain);
    if (subOut) subOut.connect(this.subGain);
    if (noiseOut) noiseOut.connect(this.noiseGain);

    this.mixer = context.createGain();
    this.mixer.gain.value = 0.5; // Headroom for summing

    this.sawGain.connect(this.mixer);
    this.pulseGain.connect(this.mixer);
    this.subGain.connect(this.mixer);
    this.noiseGain.connect(this.mixer);

    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;
    this.mixer.connect(this.ampNode);

    // 4. Define I/O contract
    this.inlets = [
      {
        label: 'pitch',
        desc: 'Base oscillator frequency in Hz (k-rate)',
        data: (v) => this.setPitch(v as number),
      },
      {
        label: 'saw',
        desc: 'Sawtooth mix level',
        data: (v) => this.sawGain.gain.setTargetAtTime(v as number, context.currentTime, 0.01),
      },
      {
        label: 'pulse',
        desc: 'Pulse mix level',
        data: (v) => this.pulseGain.gain.setTargetAtTime(v as number, context.currentTime, 0.01),
      },
      {
        label: 'pwm',
        desc: 'Pulse width modulation (-1..1)',
        audio: this.pulse.width,
      },
      {
        label: 'sub',
        desc: 'Sub-oscillator level (-1 octave square)',
        data: (v) => this.subGain.gain.setTargetAtTime(v as number, context.currentTime, 0.01),
      },
      {
        label: 'noise',
        desc: 'White noise level',
        data: (v) => this.noiseGain.gain.setTargetAtTime(v as number, context.currentTime, 0.01),
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.ampNode },
    ];
  }

  // Lifecycle & DSP API

  get frequency(): AudioParam { return this.sawtooth.frequency; }
  get detune(): AudioParam { return this.sawtooth.detune; }

  start(time?: number): void {
    this.sawtooth.start(time);
    this.pulse.start(time);
    this.sub.start(time);
    this.noise.start(time);
  }

  stop(time?: number): void {
    this.sawtooth.stop(time);
    this.pulse.stop(time);
    this.sub.stop(time);
    this.noise.stop(time);
  }

  dispose(): void { this.destroy(); }

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;

    this.sawtooth.destroy();
    this.pulse.destroy();
    this.sub.destroy();
    this.noise.destroy();

    this.sawGain.disconnect();
    this.pulseGain.disconnect();
    this.subGain.disconnect();
    this.noiseGain.disconnect();

    this.mixer.disconnect();
    this.ampNode.disconnect();
  }

  private setPitch(hz: number): void {
    if (!Number.isFinite(hz) || hz < 1) return;
    const now = context.currentTime;
    const rampEnd = now + 0.01;

    // Primary cores
    this.sawtooth.frequency.cancelScheduledValues(now);
    this.sawtooth.frequency.linearRampToValueAtTime(hz, rampEnd);
    this.pulse.frequency.cancelScheduledValues(now);
    this.pulse.frequency.linearRampToValueAtTime(hz, rampEnd);

    // Sub core is fixed at -1 octave
    this.sub.frequency.cancelScheduledValues(now);
    this.sub.frequency.linearRampToValueAtTime(hz / 2, rampEnd);
  }
}
