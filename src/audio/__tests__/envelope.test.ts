import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Envelope } from '~/audio/modules/envelope';
import { signal, context } from '~/audio';

/*
  Tests the `Envelope` class — the ADSR module extracted from Env.vue as
  the first SynthModule-shaped class in `~/audio/modules`.

  These tests exercise the DSP scheduling calls (`cancelScheduledValues`,
  `setValueAtTime`, `linearRampToValueAtTime`) through the AudioContext
  mock in `tests/setup.ts`. We don't simulate audio — we just verify the
  envelope emits the right scheduling commands in the right order with
  the right arguments.

  The mocked `context.currentTime` is always 0, so `now + attack` is
  literally the attack duration, which is convenient for assertions.
*/

function gainParamOf(env: Envelope) {
  // The 'out' outlet's `audio` is the GainNode whose `.gain` AudioParam
  // is the ADSR target. Reaching through the public outlet keeps the
  // test honest w.r.t. the SynthModule contract.
  const out = env.outlets[0].audio as GainNode;
  return out.gain;
}

describe('Envelope', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('construction', () => {
    it('uses sensible defaults when no config is provided', () => {
      const env = new Envelope();
      expect(env.attack).toBe(0.1);
      expect(env.decay).toBe(0.1);
      expect(env.sustain).toBe(0.8);
      expect(env.release).toBe(0.2);
    });

    it('overrides defaults with provided config values', () => {
      const env = new Envelope({ attack: 0.5, decay: 0.3, sustain: 0.4, release: 1.2 });
      expect(env.attack).toBe(0.5);
      expect(env.decay).toBe(0.3);
      expect(env.sustain).toBe(0.4);
      expect(env.release).toBe(1.2);
    });

    it('accepts partial config (unspecified fields keep defaults)', () => {
      const env = new Envelope({ sustain: 0.25 });
      expect(env.attack).toBe(0.1);
      expect(env.sustain).toBe(0.25);
      expect(env.release).toBe(0.2);
    });

    it('initializes the output GainNode to 0 (silent until triggered)', () => {
      const env = new Envelope();
      expect(gainParamOf(env).value).toBe(0);
    });

    it('exposes the SynthModule inlet/outlet contract', () => {
      const env = new Envelope();

      expect(env.inlets).toHaveLength(2);
      expect(env.inlets[0].label).toBe('gate');
      expect(typeof env.inlets[0].data).toBe('function');
      expect(env.inlets[1].label).toBe('mod');

      expect(env.outlets).toHaveLength(1);
      expect(env.outlets[0].label).toBe('out');
      expect(env.outlets[0].audio).toBeDefined();
    });

    it('wires signal(1) into its output gain at construction', () => {
      const source = signal(1);
      const env = new Envelope();
      // The memoized constant source should have been told to feed our gain.
      expect(source.connect).toHaveBeenCalledWith(env.outlets[0].audio);
    });
  });

  describe('.triggerAttack()', () => {
    it('cancels previously-scheduled values from `now` (not from 0)', () => {
      // Passing 0 to cancelScheduledValues would wipe the just-written
      // setValueAtTime anchor and cause pops. This test guards against
      // regressing back to that behaviour.
      const env = new Envelope();
      const g = gainParamOf(env);

      env.triggerAttack();

      expect(g.cancelScheduledValues).toHaveBeenCalledWith(context.currentTime);
    });

    it('anchors the current value at `now` before ramping', () => {
      const env = new Envelope();
      const g = gainParamOf(env);

      env.triggerAttack();

      expect(g.setValueAtTime).toHaveBeenCalledWith(g.value, context.currentTime);
    });

    it('ramps to peak (1) at now + attack, then to sustain at now + attack + decay', () => {
      const env = new Envelope({ attack: 0.25, decay: 0.5, sustain: 0.6 });
      const g = gainParamOf(env);

      env.triggerAttack();

      expect(g.linearRampToValueAtTime).toHaveBeenNthCalledWith(1, 1,   0.25);
      expect(g.linearRampToValueAtTime).toHaveBeenNthCalledWith(2, 0.6, 0.75);
    });

    it('reflects runtime mutations to attack/decay/sustain', () => {
      const env = new Envelope();
      const g = gainParamOf(env);

      env.attack = 2;
      env.decay = 3;
      env.sustain = 0.1;
      env.triggerAttack();

      expect(g.linearRampToValueAtTime).toHaveBeenNthCalledWith(1, 1,   2);
      expect(g.linearRampToValueAtTime).toHaveBeenNthCalledWith(2, 0.1, 5);
    });
  });

  describe('.triggerRelease()', () => {
    it('cancels scheduled values from `now`, re-anchors the current value, and ramps to 0 at now + release', () => {
      const env = new Envelope({ release: 0.4 });
      const g = gainParamOf(env);

      env.triggerRelease();

      expect(g.cancelScheduledValues).toHaveBeenCalledWith(context.currentTime);
      expect(g.setValueAtTime).toHaveBeenCalledWith(g.value, context.currentTime);
      expect(g.linearRampToValueAtTime).toHaveBeenCalledWith(0, 0.4);
    });

    it('reflects runtime mutation to release', () => {
      const env = new Envelope();
      const g = gainParamOf(env);

      env.release = 1.5;
      env.triggerRelease();

      expect(g.linearRampToValueAtTime).toHaveBeenCalledWith(0, 1.5);
    });
  });

  describe('.gate()', () => {
    it('non-zero velocity triggers attack', () => {
      const env = new Envelope({ attack: 0.1 });
      const g = gainParamOf(env);

      env.gate(1);

      expect(g.linearRampToValueAtTime).toHaveBeenCalledWith(1, 0.1);
    });

    it('zero velocity triggers release', () => {
      const env = new Envelope({ release: 0.3 });
      const g = gainParamOf(env);

      env.gate(0);

      expect(g.linearRampToValueAtTime).toHaveBeenCalledWith(0, 0.3);
    });

    it('is wired as the `gate` inlet callback', () => {
      // Regression guard: routing.ts treats `inlet.data` as the data-sink
      // callback, so the gate function must be reachable through that edge.
      const env = new Envelope({ attack: 0.2, release: 0.4 });
      const g = gainParamOf(env);

      env.inlets[0].data?.(1);
      expect(g.linearRampToValueAtTime).toHaveBeenCalledWith(1, 0.2);

      env.inlets[0].data?.(0);
      expect(g.linearRampToValueAtTime).toHaveBeenCalledWith(0, 0.4);
    });
  });

  describe('re-trigger safety', () => {
    it('every trigger starts with a cancel + anchor, so stacked triggers do not accumulate', () => {
      const env = new Envelope();
      const g = gainParamOf(env);

      env.triggerAttack();
      env.triggerRelease();
      env.triggerAttack();

      expect(g.cancelScheduledValues).toHaveBeenCalledTimes(3);
      expect(g.setValueAtTime).toHaveBeenCalledTimes(3);
    });
  });

  describe('.destroy()', () => {
    it('disconnects the output gain and the signal(1) edge feeding it', () => {
      const source = signal(1);
      const env = new Envelope();
      const output = env.outlets[0].audio as GainNode;

      env.destroy();

      expect(output.disconnect).toHaveBeenCalled();
      expect(source.disconnect).toHaveBeenCalledWith(output);
    });
  });
});
