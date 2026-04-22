import { context, gain } from '.';
import { registry } from './registry';

/**
 * Module-level singleton for the `MasterOut` audio path.
 *
 * MasterOut is conceptually a fixed part of the app (the single route to
 * `AudioContext.destination`), not a rack module the user instantiates. We
 * build its nodes once, at module load, and expose them through this
 * singleton. The `<MasterOut />` Vue component is a pure UI shell that reads
 * from here — mounting it twice (which would otherwise create a second pair
 * of summing gains and clobber `registry.get(0)`) is now idempotent.
 *
 * Registered with `id: 0` so `<Connection>`s that target the master bus
 * resolve without needing to wait for the Vue component to mount.
 */

const out1 = gain(0.5);
const out2 = gain(0.5);

out1.connect(context.destination);
out2.connect(context.destination);

const inlets = [
  { label: 'out-1', audio: out1 },
  { label: 'out-2', audio: out2 },
];

export const MASTER_ID = 0;

export const master = {
  id: MASTER_ID,
  out1,
  out2,
  inlets,

  /**
   * Ramp both summing gains to `g` over 100ms. Called from the UI slider.
   */
  setGain(g: number): void {
    const t = context.currentTime + 0.1;
    out1.gain.linearRampToValueAtTime(g, t);
    out2.gain.linearRampToValueAtTime(g, t);
  },
};

registry.add(MASTER_ID, { inlets });
