import { context } from '..';
import type { Inlet, Outlet, SynthModule } from '@/types/audio';
import { Pulse } from './pulse';

export type MultiWaveOptions = {
  frequency?: number;
  detune?: number;
  /** Initial selection. 0 = sine, 1 = saw, 2 = triangle, 3 = pulse. Defaults to 0. */
  sel?: 0 | 1 | 2 | 3;
  /** Initial pulse width (lane 3). Defaults to 0 (50% duty). */
  width?: number;
};

type Lane = {
  type: 'sine' | 'saw' | 'triangle' | 'pulse';
  source: OscillatorNode | Pulse;
  gate: GainNode;
};

/**
 * Four oscillator lanes (sine / saw / triangle / pulse) summed through per-lane
 * gate gains. `sel` picks which lane is audible; transitions crossfade via a
 * short gain ramp so switching is glitch-free. `width` is forwarded to the
 * internal `Pulse` lane (inactive in other modes).
 *
 * Tone has no exact equivalent; the closest is `Tone.OmniOscillator`. Our
 * crossfade semantics are intentionally simpler: at any time one lane's gate
 * is at 1 and the rest are at 0.
 */
export class MultiWave implements SynthModule {
  private lanes: Lane[];
  private pulseLane: Pulse;
  private mixer: GainNode;
  private ampNode: GainNode;
  private _sel: 0 | 1 | 2 | 3;
  private _started = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(options: MultiWaveOptions = {}) {
    const { frequency = 440, detune = 0, sel = 0, width = 0 } = options;

    this.mixer = context.createGain();
    this.mixer.gain.value = 1;

    this.pulseLane = new Pulse({ frequency, detune, width });

    this.lanes = [
      makeNativeLane('sine', frequency, detune),
      makeNativeLane('sawtooth', frequency, detune),
      makeNativeLane('triangle', frequency, detune),
      makePulseLane(this.pulseLane),
    ].map((l, i) => {
      l.gate.gain.value = i === sel ? 1 : 0;
      l.gate.connect(this.mixer);
      return l;
    });

    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;
    this.mixer.connect(this.ampNode);

    this._sel = sel;

    this.inlets = [
      {
        label: 'pitch',
        desc: 'Base oscillator frequency in Hz (k-rate). Shared across all lanes.',
        data: (v) => this.setPitch(v as number),
      },
      {
        label: 'amp',
        desc: 'Audio-rate amplitude control (additive on top of intrinsic 1)',
        audio: this.ampNode.gain,
      },
      {
        label: 'width',
        desc: 'Pulse width for the pulse lane (-1..1). Ignored by other lanes.',
        audio: this.pulseLane.width,
      },
      {
        label: 'sel',
        desc: 'Active lane: 0 sine, 1 saw, 2 triangle, 3 pulse',
        data: (v) => this.setSel(v as number),
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.ampNode },
    ];

    this.start();
  }

  // Tone-parallel DSP API

  get frequency(): AudioParam {
    // All lanes run in lockstep; return the first one's param as canonical.
    // Setting it directly would desync — prefer the `setPitch` path.
    return (this.lanes[0].source as OscillatorNode).frequency;
  }
  get detune(): AudioParam {
    return (this.lanes[0].source as OscillatorNode).detune;
  }
  get width(): AudioParam { return this.pulseLane.width; }

  get sel(): 0 | 1 | 2 | 3 { return this._sel; }
  set sel(n: 0 | 1 | 2 | 3) { this.setSel(n); }

  start(time?: number): void {
    if (this._started) return;
    const t = time ?? 0;
    for (const l of this.lanes) {
      if (l.type !== 'pulse') (l.source as OscillatorNode).start(t);
    }
    // Pulse manages its own started-flag; its constructor already called start.
    this._started = true;
  }

  stop(time?: number): void {
    if (!this._started) return;
    const t = time ?? 0;
    for (const l of this.lanes) {
      if (l.type !== 'pulse') (l.source as OscillatorNode).stop(t);
    }
    this._started = false;
  }

  dispose(): void { this.destroy(); }

  destroy(): void {
    try { this.stop(); } catch { /* already stopped */ }
    for (const l of this.lanes) {
      if (l.type === 'pulse') {
        (l.source as Pulse).destroy();
      } else {
        (l.source as OscillatorNode).disconnect();
      }
      l.gate.disconnect();
    }
    this.mixer.disconnect();
    this.ampNode.disconnect();
  }

  private setPitch(hz: number): void {
    if (!Number.isFinite(hz) || hz < 1) return;
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    for (const l of this.lanes) {
      if (l.type === 'pulse') {
        const p = l.source as Pulse;
        p.frequency.cancelScheduledValues(now);
        p.frequency.linearRampToValueAtTime(hz, rampEnd);
      } else {
        const o = l.source as OscillatorNode;
        o.frequency.cancelScheduledValues(now);
        o.frequency.linearRampToValueAtTime(hz, rampEnd);
      }
    }
  }

  private setSel(raw: number): void {
    const n = clampSel(raw);
    if (n === this._sel) return;
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    this.lanes.forEach((l, i) => {
      const target = i === n ? 1 : 0;
      l.gate.gain.cancelScheduledValues(now);
      l.gate.gain.linearRampToValueAtTime(target, rampEnd);
    });
    this._sel = n;
  }
}

function makeNativeLane(
  type: OscillatorType,
  frequency: number,
  detune: number,
): Lane {
  const source = context.createOscillator();
  source.type = type;
  source.frequency.value = frequency;
  source.detune.value = detune;
  const gate = context.createGain();
  gate.gain.value = 0;
  source.connect(gate);
  // Map native oscillator types back to our Lane['type'] label. Only sawtooth
  // needs a rename — the rest match 1:1.
  const laneType: Lane['type'] = type === 'sawtooth' ? 'saw' : (type as 'sine' | 'triangle');
  return { type: laneType, source, gate };
}

function makePulseLane(pulse: Pulse): Lane {
  const gate = context.createGain();
  gate.gain.value = 0;
  // Pulse.outlets[0].audio is its ampNode. Connect that into the gate.
  const outNode = pulse.outlets[0].audio;
  if (outNode) outNode.connect(gate);
  return { type: 'pulse', source: pulse, gate };
}

function clampSel(n: number): 0 | 1 | 2 | 3 {
  const i = Math.max(0, Math.min(3, Math.floor(n)));
  return i as 0 | 1 | 2 | 3;
}
