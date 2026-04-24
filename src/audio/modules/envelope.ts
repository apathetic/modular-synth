import { context, signal } from '..';
import type { Inlet, Outlet, SynthModule } from '~/types/audio';

/**
 * Initial ADSR parameters. All times are in seconds; `sustain` is a 0..1
 * *level* (not a duration). Any omitted fields fall back to class defaults.
 */
export type ADSRConfig = {
  attack?:  number;
  decay?:   number;
  sustain?: number;
  release?: number;
};

/**
 * Linear-ramp ADSR envelope.
 *
 * Implementation shape
 * --------------------
 *
 * The envelope's *output* is a `GainNode` whose gain we shape over time; a
 * shared `signal(1)` constant source is fed into it, so the gain
 * coefficient becomes the envelope's audible output. This is the same
 * trick Parameter uses and matches the pattern routing.ts expects — the
 * `out` inlet is an `AudioNode`, nothing more.
 *
 * `triggerAttack` / `triggerRelease` are safe to call mid-envelope: prior
 * scheduling is cancelled from *now* and the next ramp starts from the
 * current value, so re-triggering doesn't introduce discontinuities. The
 * previous component implementation called `cancelScheduledValues(0)` in
 * its release path, which wiped the already-committed starting value and
 * could produce pops — `now` is the correct argument and is used here.
 *
 * Disposal
 * --------
 *
 * `signal(1)` is a memoized module-level singleton shared by every consumer
 * (Parameter and every Envelope instance in the patch). `destroy()` tears
 * down only *our* edge (`signal(1).disconnect(this.adsr)`), never the
 * source itself.
 */
export class Envelope implements SynthModule {
  readonly inlets:  Inlet[];
  readonly outlets: Outlet[];

  attack  = 0.1;
  decay   = 0.1;
  sustain = 0.8;
  release = 0.2;

  private adsr: GainNode;

  constructor(config: ADSRConfig = {}) {
    if (config.attack  !== undefined) this.attack  = config.attack;
    if (config.decay   !== undefined) this.decay   = config.decay;
    if (config.sustain !== undefined) this.sustain = config.sustain;
    if (config.release !== undefined) this.release = config.release;

    this.adsr = context.createGain();
    this.adsr.gain.value = 0;
    signal(1).connect(this.adsr);

    this.inlets = [
      {
        label: 'gate',
        desc: 'on triggers attack, off triggers release',
        data: (v) => this.gate(v as number),
      },
      {
        label: 'mod',
        desc: 'Reserved for modulation input',
      },
    ];

    this.outlets = [
      { label: 'out', audio: this.adsr },
    ];
  }

  /**
   * Gate convenience: `0` → release, any other value → attack.
   * Bridges the data-inlet `(value) => void` contract to the A/R trigger
   * pair so upstream NoteIn/keyboard wiring can stay velocity-shaped.
   */
  gate(velocity: number): void {
    if (velocity) {
      this.triggerAttack();
    } else {
      this.triggerRelease();
    }
  }

  triggerAttack(): void {
    const now = context.currentTime;
    const g = this.adsr.gain;

    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(1,            now + this.attack);
    g.linearRampToValueAtTime(this.sustain, now + this.attack + this.decay);
  }

  triggerRelease(): void {
    const now = context.currentTime;
    const g = this.adsr.gain;

    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + this.release);
  }

  destroy(): void {
    signal(1).disconnect(this.adsr);
    this.adsr.disconnect();
  }
}
