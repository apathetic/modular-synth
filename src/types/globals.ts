import type { SynthModule } from './audio';


export type AppState = {
  power: boolean;
  isEditing: boolean;
  hoveredId?: number;
  activeId?: number;

  patches: Patch[]; // all available patches
  patch: Patch;     // active patch
  patchId: number;  // active patch id
  presetId: number; // active parameter preset id

  // UI: STUFFS
  canvasOffset?: number;
}

/**
* RackUnit represents a complete rack unit with both
* UI/positioning data (Module) and audio processing capabilities (SynthNode)
*/
export type RackUnit = {
  id: number;  // ID shared by both module and node
  module: Module;
  node: SynthNode;
};

/**
 * Registry of a live rack unit: whatever a module component `expose()`s for
 * routing. Same as SynthModule but without (legacy Options-API) modules that
 * don't yet implement `destroy()`.
 */
export type SynthNode = Partial<Pick<SynthModule, 'inlets' | 'outlets'>>;



export type MouseCoords = {
  x: number;
  y: number;
};

export type GridCoords = {
  id: number;
  col: number;
  row: number;
};

