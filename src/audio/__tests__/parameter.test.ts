import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Parameter, context } from '~/audio';

/*
  Tests the `Parameter` class — the connection-agnostic "automatable value"
  bridge used by OSC, Mixer, Filter, and routing.ts's data→audio strategy.

  The class is thin by design: it wraps a GainNode and aliases it as both
  `input` and `output`, so any AudioNode can `.connect(param.input)` and the
  same value appears at `param.output`. `.set(v)` is the sync write path
  used by the UI knob binding. `.destroy()` disconnects the underlying node.

  These tests rely on the AudioContext mock in `tests/setup.ts` — the mocked
  `createGain` returns a plain object whose `gain.value` is a writable
  number, which is exactly the surface `Parameter` exercises.
*/

describe('Parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('construction', () => {
    it('initializes the underlying gain to the provided value', () => {
      const p = new Parameter(0.75);
      expect(p.output.gain.value).toBe(0.75);
    });

    it('defaults to 0 when no value is provided', () => {
      const p = new Parameter();
      expect(p.output.gain.value).toBe(0);
    });

    it('aliases `input` and `output` to the same GainNode', () => {
      // Connection-agnostic: callers can `.connect(p.input)` to drive the
      // value, or read the value out of `p.output`, but both are the same
      // underlying summing gain.
      const p = new Parameter(1);
      expect(p.input).toBe(p.output);
    });

    it('uses a fresh GainNode per Parameter instance', () => {
      const a = new Parameter(1);
      const b = new Parameter(2);
      expect(a.output).not.toBe(b.output);
      expect(a.output.gain.value).toBe(1);
      expect(b.output.gain.value).toBe(2);
    });

    it('construction is side-effect safe (no throws)', () => {
      // The constructor wires a constant carrier (`signal(1).connect(param)`)
      // which touches the mocked AudioContext. Guard against regressions
      // that would re-introduce an unmocked method call at construction time.
      expect(() => new Parameter(0.5)).not.toThrow();
      expect(() => new Parameter()).not.toThrow();
      expect(() => new Parameter(-1)).not.toThrow();
    });
  });

  describe('.set()', () => {
    it('writes the new value to gain.value', () => {
      const p = new Parameter(0);
      p.set(0.42);
      expect(p.output.gain.value).toBe(0.42);
    });

    it('supports repeated writes', () => {
      const p = new Parameter(0);
      p.set(1);
      p.set(-0.5);
      p.set(999);
      expect(p.output.gain.value).toBe(999);
    });

    it('is bound — safe to detach from the instance', () => {
      // useParameter in routing.ts passes `param.set` as a watcher callback.
      // It's defined with closure over `param.gain` (not `this`), so losing
      // the receiver must not break it.
      const p = new Parameter(0);
      const setter = p.set;
      setter(7);
      expect(p.output.gain.value).toBe(7);
    });
  });

  describe('.destroy()', () => {
    it('disconnects the output node', () => {
      const p = new Parameter(1);
      p.destroy();
      expect(p.output.disconnect).toHaveBeenCalled();
    });

    it('is safe to call when output was never connected externally', () => {
      const p = new Parameter(1);
      expect(() => p.destroy()).not.toThrow();
    });
  });

  describe('integration with the audio graph', () => {
    it('participates as both a source (`.output.connect(...)`) and a sink (`foreignNode.connect(p.input)`)', () => {
      const p = new Parameter(0.5);
      const sink = context.createGain();
      const source = context.createGain();

      // As a source: drive another param / audio node.
      p.output.connect(sink);
      expect(p.output.connect).toHaveBeenCalledWith(sink);

      // As a sink: accept input from another node.
      source.connect(p.input);
      expect(source.connect).toHaveBeenCalledWith(p.input);
    });
  });
});
