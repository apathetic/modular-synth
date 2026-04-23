import { context } from '..';
import type { Inlet, Outlet, SynthModule } from '@/types/audio';
import { analogueSweep, type Wavetable as TableDef } from './tables';

export type WavetableOptions = {
  /** Initial frequency in Hz. Defaults to 440. */
  frequency?: number;
  /** Initial detune in cents. Defaults to 0. */
  detune?: number;
  /**
   * Table to scan through. Supply either a named built-in or a custom
   * coefficient array. Defaults to `analogueSweep`.
   */
  table?: TableDef;
  /**
   * Initial scan index in the range 0..1. 0 = first slot, 1 = last slot.
   * Intermediate values linearly crossfade between adjacent slots.
   */
  index?: number;
};

/**
 * Wavetable oscillator — two parallel `OscillatorNode`s crossfaded by a
 * fractional `index` in 0..1. Each slot of the supplied table becomes a
 * `PeriodicWave`; when `index` lands between slots `i` and `i+1` we set the
 * A oscillator to slot `i` and the B oscillator to slot `i+1`, and balance
 * their gains by the fractional part.
 *
 *     oscA (slot i)   ──► gainA ──┐
 *                                 ├──► amp ──► out
 *     oscB (slot i+1) ──► gainB ──┘
 *
 * Tone-parallel: closest analogue is `Tone.Oscillator.setPeriodicWave` plus
 * a user-managed index. No existing Tone class exposes table scanning
 * directly; our `index` AudioParam is the bridge.
 *
 * Index control is currently k-rate (handled via the `index` data inlet).
 * An audio-rate path would need a `ConstantSourceNode` + gain-routing trick;
 * left to a future revision since modulation sources in this patcher are
 * typically LFOs/envelopes feeding the k-rate data path.
 */
export class Wavetable implements SynthModule {
  private oscA: OscillatorNode;
  private oscB: OscillatorNode;
  private gainA: GainNode;
  private gainB: GainNode;
  private ampNode: GainNode;
  private waves: PeriodicWave[];
  private _table: TableDef;
  private _index: number; // 0..1
  private _activeSlot: number;
  private _started = false;

  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  constructor(options: WavetableOptions = {}) {
    const {
      frequency = 440,
      detune = 0,
      table = analogueSweep,
      index = 0,
    } = options;

    if (table.length < 2) {
      throw new Error('Wavetable requires a table with at least 2 slots');
    }
    this._table = table;
    this.waves = table.map(({ real, imag }) =>
      context.createPeriodicWave(real, imag, { disableNormalization: false }),
    );

    this.oscA = context.createOscillator();
    this.oscB = context.createOscillator();
    this.oscA.frequency.value = frequency;
    this.oscB.frequency.value = frequency;
    this.oscA.detune.value = detune;
    this.oscB.detune.value = detune;

    this.gainA = context.createGain();
    this.gainB = context.createGain();
    this.ampNode = context.createGain();
    this.ampNode.gain.value = 1;

    this.oscA.connect(this.gainA);
    this.oscB.connect(this.gainB);
    this.gainA.connect(this.ampNode);
    this.gainB.connect(this.ampNode);

    this._index = clamp01(index);
    this._activeSlot = -1; // force initial slot update
    this.applyIndex(this._index, /*ramp=*/false);

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
        label: 'index',
        desc: 'Table scan position 0..1 (k-rate)',
        data: (v) => this.setIndex(v as number),
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.ampNode },
    ];

    this.start();
  }

  // Tone-parallel DSP API

  get frequency(): AudioParam { return this.oscA.frequency; }
  get detune(): AudioParam { return this.oscA.detune; }
  get index(): number { return this._index; }
  set index(value: number) { this.setIndex(value); }

  get table(): TableDef { return this._table; }
  set table(next: TableDef) {
    if (next.length < 2) {
      throw new Error('Wavetable requires a table with at least 2 slots');
    }
    this._table = next;
    this.waves = next.map(({ real, imag }) =>
      context.createPeriodicWave(real, imag, { disableNormalization: false }),
    );
    this._activeSlot = -1;
    this.applyIndex(this._index, /*ramp=*/false);
  }

  start(time?: number): void {
    if (this._started) return;
    const t = time ?? 0;
    this.oscA.start(t);
    this.oscB.start(t);
    this._started = true;
  }

  stop(time?: number): void {
    if (!this._started) return;
    const t = time ?? 0;
    this.oscA.stop(t);
    this.oscB.stop(t);
    this._started = false;
  }

  dispose(): void { this.destroy(); }

  destroy(): void {
    try { this.stop(); } catch { /* already stopped */ }
    this.oscA.disconnect();
    this.oscB.disconnect();
    this.gainA.disconnect();
    this.gainB.disconnect();
    this.ampNode.disconnect();
  }

  private setPitch(hz: number): void {
    if (!Number.isFinite(hz) || hz < 1) return;
    const now = context.currentTime;
    const rampEnd = now + 0.01;
    for (const osc of [this.oscA, this.oscB]) {
      osc.frequency.cancelScheduledValues(now);
      osc.frequency.linearRampToValueAtTime(hz, rampEnd);
    }
  }

  private setIndex(value: number): void {
    this._index = clamp01(value);
    this.applyIndex(this._index, /*ramp=*/true);
  }

  /**
   * Map `index` (0..1) to a pair of table slots and a fractional mix. Only
   * reassigns `PeriodicWave`s when the integer slot actually changes — the
   * gain crossfade handles the continuous blend.
   */
  private applyIndex(index: number, ramp: boolean): void {
    const N = this._table.length;
    const scaled = index * (N - 1);
    const slot = Math.min(N - 2, Math.floor(scaled));
    const frac = scaled - slot;
    if (slot !== this._activeSlot) {
      this.oscA.setPeriodicWave(this.waves[slot]);
      this.oscB.setPeriodicWave(this.waves[slot + 1]);
      this._activeSlot = slot;
    }
    const now = context.currentTime;
    const rampEnd = now + (ramp ? 0.01 : 0);
    for (const [gain, target] of [
      [this.gainA, 1 - frac],
      [this.gainB, frac],
    ] as const) {
      gain.gain.cancelScheduledValues(now);
      if (ramp) {
        gain.gain.linearRampToValueAtTime(target, rampEnd);
      } else {
        gain.gain.setValueAtTime(target, now);
      }
    }
  }
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
