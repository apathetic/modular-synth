/**
 * The `SynthModule` contract — what every audio module in `@/audio/modules`
 * implements and what `<Unit>` / `<Connection>` consume.
 *
 * This file is the foundation for a gradual migration of rack-module DSP out
 * of Vue components (`src/components/modules/*.vue`) and into plain TS
 * classes/factories in `src/audio/modules/`. See `docs/architecture.md` for
 * the bigger picture of the "three parallel graphs".
 *
 * Design notes
 * ------------
 *
 * Inlets and outlets are intentionally asymmetric on their `data` field:
 *
 *   - `Inlet.data`  is a **callback** `(value) => void` invoked when a
 *                    connection delivers a value. Owned by the sink.
 *   - `Outlet.data` is a **property name** (string) that the routing layer
 *                    watches on the source via Vue's `$watch`. Owned by the
 *                    source. Today this only works for Options-API modules
 *                    (LFO is the sole data-emitting module). Once more
 *                    modules migrate to composition-API classes, we'll
 *                    likely replace this with a proper emitter contract —
 *                    tracked as future work.
 *
 * `audio` accepts both `AudioNode` and `AudioParam` because some inlets (e.g.
 * VCA's gain CV) bind directly to a node's AudioParam. `AudioNode.connect`
 * accepts both targets, so this works through `routing.wire()` unchanged.
 *
 * See also
 * --------
 *
 * * `src/audio/routing.ts`     — the `wire()` function that consumes this
 *                                contract (audio→audio, data→audio, data→data).
 * * `src/types/globals.ts`     — `SynthNode`, now a `Partial<Pick<SynthModule,
 *                                'inlets' | 'outlets'>>` alias used by the
 *                                store registry. Stays distinct until every
 *                                module implements `destroy()`, at which
 *                                point consumers can switch to `SynthModule`.
 */

export type Inlet = {
  label?: string;
  desc?: string;

  /** Destination for an audio edge. Accepts AudioParams too. */
  audio?: AudioNode | AudioParam;

  /** Callback invoked by `routing.wire()` when a data edge delivers a value. */
  data?: (value: unknown) => void;
};

export type Outlet = {
  label?: string;
  desc?: string;

  /** Source of an audio edge. */
  audio?: AudioNode;

  /**
   * Name of a property on the owning module to `$watch`. See the file-level
   * note — this is currently Options-API-only and is expected to evolve.
   */
  data?: string;
};

/**
 * A self-contained audio module.
 *
 * Owns its AudioNodes, exposes named inlets/outlets for `<Connection>`
 * routing, and disposes cleanly. Completely Vue-unaware: no refs, no
 * injection, no lifecycle hooks — just a class/factory that holds an audio
 * subgraph.
 *
 * Module components in `src/components/modules/*.vue` become UI shells that
 * instantiate a `SynthModule`, bind reactive refs to its setters, and call
 * `destroy()` in `onUnmounted`.
 */
export type SynthModule = {
  readonly inlets: Inlet[];
  readonly outlets: Outlet[];

  /**
   * Release all audio resources owned by this module: stop oscillators,
   * disconnect internal edges, destroy owned `Parameter`s. External
   * edges (wires to other modules) are the routing layer's responsibility
   * via `WireResult.unwire`.
   */
  destroy(): void;
};
