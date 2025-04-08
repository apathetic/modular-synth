// import type { Session } from "@supabase/supabase-js";

type PatchKey = number; // string; // uuid; // string

type AppState = {
  power: boolean;
  isEditing: boolean;
  hoveredId?: number;
  activeId?: number;

  patches: Patch[]; // all available patches
  patch: Patch;     // active patch
  patchId: number;  // active patch id
  configId: number; // active parameter config id

  // references to all audio nodes in the current patch.
  registry: {[value: number]: SynthNode};

  session?: Session;

  // UI: STUFFS
  canvasOffset?: number;
}

// for alt PatchStore:
// export type PatchState = Patch & {
//   activeId?: number;
//   hoveredId?: number;
//   configId: number;

//   registry: {[value: number]: SynthNode};
// };

// interface UserState {
//   session: Session;
// }

type Patch = {
  id: string;
  i: PatchKey; // TODO use uuid for things
  loaded: boolean; // patch must be loaded (via `loadPatch`) so that modules, connections, and parameters are correctly instantiated
  name: string;
  modules: Module[];
  connections: Connection[];
  configs: Config[];
};

type moduleType = 'Analyser' | 'Clock' | 'Compressor' | 'Debugger' | 'Delay' | 'Drive' | 'Env' | 'Filter' | 'LFO' | 'Mixer' | 'Node' | 'NoteIn' | 'OSC' | 'Reverb' | 'VCA' | 'VCF';

type Module = {
  id: number;
  type: moduleType;
  col: number;
  row: number;
  w?: number;
  h?: number;
  x: number;
  y: number;
};



/**
 * RackUnit represents a complete rack unit with both
 * UI/positioning data (Module) and audio processing capabilities (SynthNode)
 */
type RackUnit = {
  id: number;  // ID shared by both module and node
  module: Module;
  node: SynthNode;
};

// A reference to the rendered node (ie. in the APP)
//  * with webaudio inlets/outlets
//  * also includes coords?
type SynthNode = {
  inlets?: Inlet[];
  outlets?: Outlet[];
};



// type MasterOut = Pick<Module, 'type'|'id'> {
//   type: 'MasterOut';
//   id: 0;
//   x: 0;
//   y: 0;
// };




// interface Settings ?
interface Config {
  name: string;
  parameters: Parameters;
}

type parameterLabel = `${Module['id']}-${string}`;
type Parameters = Record<parameterLabel, string|number>;



type Connection = {
  id: number;
  from: {
    id: number;
    port: number;
  };
  to: {
    id: number;
    port: number;
  };
};

// type port = {
type Inlet = {
  // data: () => void | audio: AudioNode;
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



type MouseCoords = {
  x: number;
  y: number;
  // id:
};

type GridCoords = {
  id: number;
  col: number;
  row: number;
};