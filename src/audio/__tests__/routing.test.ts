import { describe, it, expect, vi, beforeEach } from 'vitest';
import { wire } from '../routing';

vi.mock('@/audio', () => ({
  Parameter: vi.fn().mockImplementation(() => ({
    set: vi.fn(),
    output: { connect: vi.fn() },
    destroy: vi.fn(),
  })),
}));

import { Parameter } from '@/audio';

/**
 * Build a minimal `SynthNode` stand-in with arbitrary inlets/outlets. We
 * only populate the fields each test actually exercises; everything else
 * stays undefined the way a real sparse module would have it.
 */
function makeNode(opts: {
  inlets?: Array<Record<string, unknown>>;
  outlets?: Array<Record<string, unknown>>;
  withWatch?: boolean;
}) {
  const node: Record<string, unknown> = {
    inlets: opts.inlets,
    outlets: opts.outlets,
  };
  if (opts.withWatch) {
    node.$watch = vi.fn().mockReturnValue(vi.fn());
  }
  return node as any;
}

describe('wire()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('audio -> audio', () => {
    it('connects source audio to destination audio and returns unwire', () => {
      const srcAudio = { connect: vi.fn(), disconnect: vi.fn() };
      const destAudio = {};
      const src = makeNode({ outlets: [{ audio: srcAudio }] });
      const dest = makeNode({ inlets: [{ audio: destAudio }] });

      const result = wire({ node: src, port: 0 }, { node: dest, port: 0 });

      expect(result.kind).toBe('audio');
      expect(srcAudio.connect).toHaveBeenCalledWith(destAudio);
      expect(srcAudio.disconnect).not.toHaveBeenCalled();

      result.unwire();
      expect(srcAudio.disconnect).toHaveBeenCalledWith(destAudio);
    });
  });

  describe('data -> audio', () => {
    it('bridges a watched prop through a Parameter interpolator', () => {
      const destAudio = {};
      const src = makeNode({
        outlets: [{ data: 'frequency' }],
        withWatch: true,
      });
      const dest = makeNode({ inlets: [{ audio: destAudio }] });

      const result = wire({ node: src, port: 0 }, { node: dest, port: 0 });

      expect(result.kind).toBe('data-audio');
      expect(Parameter).toHaveBeenCalledTimes(1);

      const interpolator = (Parameter as any).mock.results[0].value;
      expect(src.$watch).toHaveBeenCalledWith('frequency', expect.any(Function));
      // Verify the watch handler actually feeds the interpolator.
      const handler = src.$watch.mock.calls[0][1];
      handler(123);
      expect(interpolator.set).toHaveBeenCalledWith(123);
      expect(interpolator.output.connect).toHaveBeenCalledWith(destAudio);
    });

    it('tears down watch and destroys the interpolator on unwire', () => {
      const unwatch = vi.fn();
      const src = makeNode({ outlets: [{ data: 'frequency' }] });
      src.$watch = vi.fn().mockReturnValue(unwatch);

      const dest = makeNode({ inlets: [{ audio: {} }] });

      const result = wire({ node: src, port: 0 }, { node: dest, port: 0 });
      result.unwire();

      const interpolator = (Parameter as any).mock.results[0].value;
      expect(unwatch).toHaveBeenCalled();
      expect(interpolator.destroy).toHaveBeenCalled();
    });
  });

  describe('data -> data', () => {
    it('subscribes inlet callback to outlet prop', () => {
      const inletCb = vi.fn();
      const src = makeNode({
        outlets: [{ data: 'freq' }],
        withWatch: true,
      });
      const dest = makeNode({ inlets: [{ data: inletCb }] });

      const result = wire({ node: src, port: 0 }, { node: dest, port: 0 });

      expect(result.kind).toBe('data-data');
      expect(src.$watch).toHaveBeenCalledWith('freq', inletCb);
    });

    it('unwire calls the watch disposer', () => {
      const unwatch = vi.fn();
      const src = makeNode({ outlets: [{ data: 'freq' }] });
      src.$watch = vi.fn().mockReturnValue(unwatch);
      const dest = makeNode({ inlets: [{ data: vi.fn() }] });

      const result = wire({ node: src, port: 0 }, { node: dest, port: 0 });
      result.unwire();

      expect(unwatch).toHaveBeenCalled();
    });
  });

  describe('errors', () => {
    it('throws when an outlet is missing', () => {
      const src = makeNode({ outlets: [] });
      const dest = makeNode({ inlets: [{ audio: {} }] });

      expect(() => wire({ node: src, port: 0 }, { node: dest, port: 0 }))
        .toThrow(/port not found/);
    });

    it('throws when an inlet is missing', () => {
      const src = makeNode({ outlets: [{ audio: {} }] });
      const dest = makeNode({ inlets: [] });

      expect(() => wire({ node: src, port: 0 }, { node: dest, port: 0 }))
        .toThrow(/port not found/);
    });

    it('throws on mismatched port kinds (audio -> data)', () => {
      const src = makeNode({ outlets: [{ audio: { connect: vi.fn() } }] });
      const dest = makeNode({ inlets: [{ data: vi.fn() }] });

      expect(() => wire({ node: src, port: 0 }, { node: dest, port: 0 }))
        .toThrow(/mismatched port kinds/);
    });

    it('throws when a data source lacks $watch', () => {
      const src = makeNode({ outlets: [{ data: 'freq' }] }); // no withWatch
      const dest = makeNode({ inlets: [{ audio: {} }] });

      expect(() => wire({ node: src, port: 0 }, { node: dest, port: 0 }))
        .toThrow(/no \$watch/);
    });
  });
});
