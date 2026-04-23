import type { SynthNode } from '@/types/globals';

/**
 * Runtime-only registry that maps moduleIds to their `SynthNode` (the
 * inlets/outlets backed by `AudioNode`s and data-port callbacks).
 *
 * Kept OUT of the app state on purpose:
 *   - `AudioNode` / `AudioContext` handles are not structured-cloneable and
 *     would poison any serialization pass that reached them.
 *   - Registry mutations (add on module mount, remove on unmount) happen on
 *     every patch load; making them reactive just causes the persistence
 *     watcher to thrash with no UI benefit.
 *   - No template ever reads the registry directly — only imperative code
 *     paths (ie. the <Connection />'s routing effect, the app-wide clear
 *     action) need access.
 */
const nodes = new Map<number, SynthNode>();

export const registry = {
  add(id: number, node: SynthNode): void {
    nodes.set(id, node);
  },

  remove(id: number): void {
    nodes.delete(id);
  },

  get(id: number): SynthNode | undefined {
    return nodes.get(id);
  },

  has(id: number): boolean {
    return nodes.has(id);
  },

  clear(): void {
    nodes.clear();
  },
};
