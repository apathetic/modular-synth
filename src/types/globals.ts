
// type moduleType = 'Analyser' | 'Clock' | 'Compressor' | 'Debugger' | 'Delay' | 'Drive' | 'Env' | 'Filter' | 'LFO' | 'Mixer' | 'Node' | 'NoteIn' | 'OSC' | 'Reverb' | 'VCA' | 'VCF';

// type MasterOut = Pick<Module, 'type'|'id'> {
//   type: 'MasterOut';
//   id: 0;
//   x: 0;
//   y: 0;
// };

// type Module = {
//   id: number;
//   type: moduleType;
//   col: number;
//   row: number;
//   w?: number;
//   h?: number;
//   x: number;
//   y: number;
// };

// type Connection = {
//   id: number;
//   from: {
//     id: number;
//     port: number;
//   };
//   to: {
//     id: number;
//     port: number;
//   };
// };
//
// type Config = {
//   name: string;
//   parameters: Parameters;
// };
//
// type Patch = {
//   id: string;
//   i: PatchKey;
//   loaded: boolean;
//   name: string;
//   modules: Module[];
//   connections: Connection[];
//   configs: Config[];
// };



export type AppState = {
  power: boolean;
  isEditing: boolean;
  hoveredId?: number;
  activeId?: number;

  patches: Patch[]; // all available patches
  patch: Patch;     // active patch
  patchId: number;  // active patch id
  presetId: number; // active parameter preset id

  // references to all audio nodes in the current patch.
  registry: {[value: number]: SynthNode};

  // session?: Session;

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

// A reference to the rendered node (ie. in the APP)
//  * with webaudio inlets/outlets
//  * also includes coords?
export type SynthNode = {
  inlets?: Inlet[];
  outlets?: Outlet[];
};

// type parameterLabel = `${Module['id']}-${string}`;
// type Parameters = Record<parameterLabel, string|number>;

// type port = {
type Inlet = {
  audio?: AudioNode; ///   audioNode: any; // webaudioNOde / elementary node / tone class / etc
  data?: () => void;
  label?: string;
  desc?: string;
}

type Outlet = {
  audio?: AudioNode;
  data?: () => void;
  label?: string;
  desc?: string;
}

// export type Inlet = port;
// export type Outlet = port;



export type MouseCoords = {
  x: number;
  y: number;
  // id:
};

export type GridCoords = {
  id: number;
  col: number;
  row: number;
};

