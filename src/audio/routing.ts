import { Parameter } from '~/audio';
import type { SynthNode } from '~/types/globals';

/**
 * One end of a potential connection: a live `SynthNode` plus which of its
 * inlet/outlet indices we're binding to.
 */
export type PortRef = {
  node: SynthNode;
  port: number;
};

/**
 * What `wire()` hands back: a disposer and a tag naming the strategy used.
 * Call `unwire()` once on teardown (e.g. component unmount). Calling it
 * more than once is a bug — we don't defend against it, since connections
 * are 1:1 with their lifecycle owner.
 */
export type WireResult = {
  kind: 'audio' | 'data-audio' | 'data-data';
  unwire: () => void;
};

/**
 * Connect an outlet of one `SynthNode` to an inlet of another, picking the
 * right strategy based on what each port actually exposes:
 *
 *   - `audio → audio`   direct `AudioNode.connect()`
 *   - `data  → audio`   interpolating `Parameter` bridging a watched prop
 *   - `data  → data`    callback-style subscription via the source's
 *                       `$watch` (Options-API modules only; see below)
 *
 * Throws if the port pair can't be routed — missing ports, mismatched
 * kinds, or a data outlet on a source that lacks `$watch`. Callers are
 * expected to surface the error to the user (the `<Connection>` component
 * responds by removing the connection from the patch).
 *
 * NOTE on `$watch`: the data-bearing paths assume `from.node` is (or
 * proxies) a Vue Options-API component instance, because `outlet.data` is
 * treated as a *property name* to watch on that instance. Composition-API
 * modules don't expose `$watch` and therefore can't currently act as
 * data sources. This is a pre-existing constraint, preserved here
 * deliberately — fixing it belongs in a separate pass once the module
 * contract is properly formalized.
 */
export function wire(from: PortRef, to: PortRef): WireResult {
  const outlet = from.node.outlets?.[from.port];
  const inlet = to.node.inlets?.[to.port];

  if (!outlet || !inlet) {
    throw new Error(`routing: port not found (from ${from.port}, to ${to.port})`);
  }

  // -----------------------------------------------------------------------
  // audio -> audio
  // -----------------------------------------------------------------------
  if (outlet.audio && inlet.audio) {
    const source = outlet.audio;
    const destination = inlet.audio;

    source.connect(destination);

    return {
      kind: 'audio',
      unwire: () => source.disconnect(destination),
    };
  }

  // -----------------------------------------------------------------------
  // data -> audio  (interpolated via a Parameter)
  // -----------------------------------------------------------------------
  if (outlet.data && inlet.audio) {
    const interpolator = new Parameter(0);

    const unwatch = watchOnNode(from.node, outlet.data, (v) => interpolator.set(v as number));
    interpolator.output.connect(inlet.audio);

    return {
      kind: 'data-audio',
      unwire: () => {
        unwatch();
        interpolator.destroy();
      },
    };
  }

  // -----------------------------------------------------------------------
  // data -> data  (direct callback)
  // -----------------------------------------------------------------------
  if (outlet.data && inlet.data && typeof inlet.data === 'function') {
    const unwatch = watchOnNode(from.node, outlet.data, inlet.data);

    return {
      kind: 'data-data',
      unwire: unwatch,
    };
  }

  const outKind = outlet.data ? 'data' : outlet.audio ? 'audio' : 'unknown';
  const inKind  = inlet.data  ? 'data' : inlet.audio  ? 'audio' : 'unknown';
  throw new Error(`routing: mismatched port kinds (${outKind} -> ${inKind})`);
}

/**
 * Subscribe to a property change on a Vue Options-API-backed SynthNode via
 * its `$watch`. `prop` is the value of `outlet.data`, which the data-port
 * contract treats as a property name. Typed loosely because `SynthNode` is
 * declared minimally and `$watch` isn't part of its surface.
 */
function watchOnNode(
  node: SynthNode,
  prop: unknown,
  handler: (value: unknown) => void,
): () => void {
  const $watch = (node as unknown as { $watch?: (p: unknown, cb: (v: unknown) => void) => () => void }).$watch;

  if (typeof $watch !== 'function') {
    throw new Error('routing: data source has no $watch (Composition-API module?)');
  }

  return $watch.call(node, prop, handler);
}
