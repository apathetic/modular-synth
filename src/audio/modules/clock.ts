import type { Inlet, Outlet, SynthModule } from '@/types/audio';

/**
 * Musical division of the underlying beat. Matches Tone.js-style notation
 * (`4n` = quarter note, `8n` = eighth, etc.) so that if we ever swap the
 * scheduler for a Tone.Transport, the vocabulary is already aligned.
 */
export type ClockDivision = '4n' | '8n' | '16n' | '32n';

/**
 * Initial configuration. Any field omitted falls back to the class defaults
 * declared as field initializers below.
 */
export type ClockConfig = {
  bpm?: number;
  division?: ClockDivision;
  /** Swing amount in 0..1 — fraction of the interval added/subtracted on odd ticks. */
  shuffle?: number;
  /** Auto-reset cadence in ticks. `0` disables auto-reset. */
  resetEvery?: number;
  /** Gate-high duration in milliseconds. */
  gateMs?: number;

  onGate?: (v: 0 | 1) => void;
  onReset?: () => void;
};

/**
 * Converts a division name to a multiplier relative to a quarter-note beat.
 * 4n = 1, 8n = 0.5, 16n = 0.25, 32n = 0.125.
 */
const DIVISION_FACTOR: Record<ClockDivision, number> = {
  '4n':  1,
  '8n':  0.5,
  '16n': 0.25,
  '32n': 0.125,
};

/**
 * Scheduler-backed tempo source.
 *
 * Implementation shape
 * --------------------
 *
 * The clock does not expose AudioNode ports — `gate` and `reset` are
 * *data* outlets owned by the Vue shell around this class. The shell
 * constructs the class with `onGate`/`onReset` callbacks that flip its
 * reactive refs, and `routing.wire()` picks those refs up through
 * `$watch` on the component instance. The shape mirrors the Envelope →
 * Env.vue split: DSP stays Vue-unaware, UI stays data-flow-unaware.
 *
 * Scheduling
 * ----------
 *
 * Drift-corrected `setTimeout`: every scheduled tick stores its *target*
 * wall-clock time and the next tick is computed against that target
 * rather than "now", so timer overshoot doesn't accumulate across ticks.
 * A second short timer drops the gate back to 0 after `gateMs`. This is
 * not sample-accurate — fine for a data-rate gate at musical tempi — and
 * can be swapped for an `AudioContext.currentTime` lookahead scheduler
 * later without changing the outlet contract.
 *
 * Swing is a simple alternating offset: odd ticks land late by
 * `shuffle * interval`, even ticks land early by the same amount, so the
 * pair-average still equals the nominal interval.
 */
export class Clock implements SynthModule {
  readonly inlets:  Inlet[]  = [];
  readonly outlets: Outlet[] = [];

  bpm        = 120;
  division: ClockDivision = '16n';
  shuffle    = 0;
  resetEvery = 64;
  gateMs     = 10;

  onGate: (v: 0 | 1) => void = () => {};
  onReset: () => void        = () => {};

  private running   = false;
  private tickIndex = 0;
  private tickTimer: ReturnType<typeof setTimeout> | null = null;
  private gateTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: ClockConfig = {}) {
    if (config.bpm        !== undefined) this.bpm        = config.bpm;
    if (config.division   !== undefined) this.division   = config.division;
    if (config.shuffle    !== undefined) this.shuffle    = config.shuffle;
    if (config.resetEvery !== undefined) this.resetEvery = config.resetEvery;
    if (config.gateMs     !== undefined) this.gateMs     = config.gateMs;
    if (config.onGate)                   this.onGate     = config.onGate;
    if (config.onReset)                  this.onReset    = config.onReset;
  }

  /**
   * Begin ticking. Fires an immediate reset pulse so downstream
   * sequencers start aligned, then schedules the first gate tick one
   * interval out.
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.tickIndex = 0;
    this.onReset();
    this.scheduleNext(performance.now());
  }

  /**
   * Halt ticking. Forces the gate low so any held envelope releases,
   * but leaves `tickIndex` untouched — a subsequent `start()` resets it.
   */
  stop(): void {
    if (!this.running) return;
    this.running = false;

    if (this.tickTimer !== null) { clearTimeout(this.tickTimer); this.tickTimer = null; }
    if (this.gateTimer !== null) { clearTimeout(this.gateTimer); this.gateTimer = null; }

    this.onGate(0);
  }

  /**
   * Re-align to tick 0 and fire a reset pulse. Safe to call while
   * stopped (no timers in flight).
   */
  reset(): void {
    this.tickIndex = 0;
    this.onReset();
  }

  destroy(): void {
    this.stop();
  }

  // ---------------------------------------------------------------------

  private scheduleNext(previousTarget: number): void {
    const target = previousTarget + this.intervalFor(this.tickIndex);
    const delay = Math.max(0, target - performance.now());
    this.tickTimer = setTimeout(() => this.fire(target), delay);
  }

  private fire(target: number): void {
    if (!this.running) return;

    this.onGate(1);
    if (this.gateTimer !== null) clearTimeout(this.gateTimer);
    this.gateTimer = setTimeout(() => this.onGate(0), this.gateMs);

    this.tickIndex++;

    if (this.resetEvery > 0 && this.tickIndex % this.resetEvery === 0) {
      this.onReset();
    }

    this.scheduleNext(target);
  }

  /**
   * Milliseconds until the tick at the given index should fire, measured
   * from the previous tick's target. Swing alternates pairs so the
   * average stays on the nominal interval.
   */
  private intervalFor(i: number): number {
    const base = (60_000 / this.bpm) * DIVISION_FACTOR[this.division];
    const offset = base * this.shuffle;
    return i % 2 === 0 ? base - offset : base + offset;
  }
}
