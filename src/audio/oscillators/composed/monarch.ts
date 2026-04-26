import { context } from '../..';
import type { Inlet, Outlet, SynthModule } from '~/types/audio';
import { Saw } from '../saw';
import { Pulse } from '../pulse';
import { Triangle } from '../triangle';

export type MonarchOptions = {
  frequency?: number;
  detune?: number;
  fm?: number;
};

export class Monarch implements SynthModule {
  private tri: Triangle;
  private saw: Saw;
  private pulse: Pulse;

  private triGate: GainNode;
  private sawGate: GainNode;
  private pulseGate: GainNode;
  private mixer: GainNode;

  private fmDepth: GainNode;
  private modDepth: GainNode;

  private _waveform: number = 0; // 0: Tri, 1: RevSaw, 2: Saw, 3: Sqr, 4: Wide, 5: Narrow
  private _range: number = 2; // 0: 32', 1: 16', 2: 8' (default), 3: 4', 4: 2', 5: LO
  private _kt: number = 1; // 1: Key Tracking on, 0: off
  private _basePitch: number = 440;
  private _frequencyKnobHz: number = 440;
  
  // Frequency multiplier based on range (32, 16, 8, 4, 2, LO)
  private readonly RANGE_MULTS = [0.25, 0.5, 1.0, 2.0, 4.0, 0.01];

  private _destroyed = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(opts: MonarchOptions = {}) {
    const {
      frequency = 440,
      detune    = 0,
      fm        = 0,
    } = opts;

    this.tri = new Triangle({ frequency, detune });
    this.saw = new Saw({ frequency, detune });
    this.pulse = new Pulse({ frequency, detune, width: 0 });

    this.triGate = context.createGain();
    this.sawGate = context.createGain();
    this.pulseGate = context.createGain();
    
    // Start with Triangle
    this.triGate.gain.value = 1;
    this.sawGate.gain.value = 0;
    this.pulseGate.gain.value = 0;

    const triOut = this.tri.outlets[0].audio;
    const sawOut = this.saw.outlets[0].audio;
    const pulseOut = this.pulse.outlets[0].audio;

    if (triOut) triOut.connect(this.triGate);
    if (sawOut) sawOut.connect(this.sawGate);
    if (pulseOut) pulseOut.connect(this.pulseGate);

    this.mixer = context.createGain();
    this.mixer.gain.value = 1.0;
    this.triGate.connect(this.mixer);
    this.sawGate.connect(this.mixer);
    this.pulseGate.connect(this.mixer);

    this.fmDepth = context.createGain();
    this.fmDepth.gain.value = fm;

    this.modDepth = context.createGain();
    this.modDepth.gain.value = 1;

    this.fmDepth.connect(this.tri.frequency);
    this.fmDepth.connect(this.saw.frequency);
    this.fmDepth.connect(this.pulse.frequency);

    this.modDepth.connect(this.pulse.width);

    this.inlets = [
      {
        label: 'pitch',
        desc:  'Base frequency in Hz. Applied if KT is on.',
        data:  (v) => this.setPitch(v as number),
      },
      {
        label: 'fm',
        desc:  'Audio-rate frequency modulation.',
        audio: this.fmDepth,
      },
      {
        label: 'mod',
        desc:  'Pulse width modulation.',
        audio: this.modDepth,
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.mixer },
    ];
    
    this.updateFrequency();
  }

  // --- Parameter Accessors ---

  get fm(): AudioParam { return this.fmDepth.gain; }
  
  // Custom accessors for UI
  get waveform(): number { return this._waveform; }
  set waveform(v: number) { this.setWaveform(v); }
  
  get range(): number { return this._range; }
  set range(v: number) { this.setRange(v); }

  get kt(): number { return this._kt; }
  set kt(v: number) { this.setKt(v); }

  // --- Control Methods ---

  start(time?: number): void {
    this.tri.start?.(time);
    this.saw.start?.(time);
    this.pulse.start?.(time);
  }

  stop(time?: number): void {
    this.tri.stop?.(time);
    this.saw.stop?.(time);
    this.pulse.stop?.(time);
  }

  destroy(): void {
    if (this._destroyed) return;
    this._destroyed = true;

    this.tri.destroy();
    this.saw.destroy();
    this.pulse.destroy();

    this.triGate.disconnect();
    this.sawGate.disconnect();
    this.pulseGate.disconnect();
    this.mixer.disconnect();
    this.fmDepth.disconnect();
    this.modDepth.disconnect();
  }

  // --- Internal Updates ---

  private setPitch(hz: number): void {
    if (!Number.isFinite(hz) || hz < 1) return;
    this._basePitch = hz;
    this.updateFrequency();
  }

  private setKt(val: number): void {
    this._kt = val;
    this.updateFrequency();
  }

  private setRange(val: number): void {
    this._range = Math.max(0, Math.min(5, val));
    this.updateFrequency();
  }

  private updateFrequency(): void {
    const mult = this.RANGE_MULTS[this._range];
    
    // If KT is on, pitch follows the inlet. If KT is off, pitch is set by the Frequency knob.
    const baseHz = this._kt > 0 ? this._basePitch : this._frequencyKnobHz;
    const targetHz = baseHz * mult;
    
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    
    this.tri.frequency.cancelScheduledValues(now);
    this.tri.frequency.linearRampToValueAtTime(targetHz, rampEnd);
    
    this.saw.frequency.cancelScheduledValues(now);
    this.saw.frequency.linearRampToValueAtTime(targetHz, rampEnd);
    
    this.pulse.frequency.cancelScheduledValues(now);
    this.pulse.frequency.linearRampToValueAtTime(targetHz, rampEnd);
  }

  public setFrequency(hz: number): void {
    if (!Number.isFinite(hz)) return;
    this._frequencyKnobHz = hz;
    this.updateFrequency();
  }

  public setDetune(cents: number): void {
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    this.tri.detune.linearRampToValueAtTime(cents, rampEnd);
    this.saw.detune.linearRampToValueAtTime(cents, rampEnd);
    this.pulse.detune.linearRampToValueAtTime(cents, rampEnd);
  }

  private setWaveform(val: number): void {
    const s = Math.max(0, Math.min(5, val));
    if (s === this._waveform) return;
    this._waveform = s;

    const now = context.currentTime;
    const rampEnd = now + 0.01;

    this.triGate.gain.cancelScheduledValues(now);
    this.sawGate.gain.cancelScheduledValues(now);
    this.pulseGate.gain.cancelScheduledValues(now);

    let triVol = 0, sawVol = 0, pulseVol = 0;
    
    // Reverse Saw (1) just uses Saw for now (a true Reverse Saw requires a different primitive)
    switch(s) {
      case 0: // Triangle
        triVol = 1; break;
      case 1: // Reverse Saw (approximate with Saw for now)
        sawVol = 1; break;
      case 2: // Saw
        sawVol = 1; break;
      case 3: // Square (Pulse 50%)
        pulseVol = 1; 
        this.pulse.width.setValueAtTime(0, now); 
        break;
      case 4: // Wide Pulse (e.g. 25%)
        pulseVol = 1; 
        this.pulse.width.setValueAtTime(0.5, now); 
        break;
      case 5: // Narrow Pulse (e.g. ~10%)
        pulseVol = 1; 
        this.pulse.width.setValueAtTime(0.8, now); 
        break;
    }

    this.triGate.gain.linearRampToValueAtTime(triVol, rampEnd);
    this.sawGate.gain.linearRampToValueAtTime(sawVol, rampEnd);
    this.pulseGate.gain.linearRampToValueAtTime(pulseVol, rampEnd);
  }
}
