import type { Session } from "@supabase/supabase-js";

type PatchKey = number; // string; // uuid; // string

export type AppState = {
  power: boolean;
  isEditing: boolean;
  hoveredId?: number;
  activeId?: number;

  patches: Patch[]; // all available patches
  patchId: number;  // active patch id
  configId: number; // active parameter config id

  // references to all audio nodes in the current patch.
  // Nodes/Modules are kinda conflated / they share the same `this` instance ... :(
  registry: {[value: number]: SynthNode};

  session?: Session;

  // UI: STUFFS
  canvasOffset?: number;
}

// for alt PatchStore:
export type PatchState = Patch & {
  activeId?: number;
  hoveredId?: number;
  configId: number;

  registry: {[value: number]: SynthNode};
};

// export interface UserState {
//   session: Session;
// }

export type Patch = {
  id: string;
  i: PatchKey;
  name: string;
  modules: Module[];
  connections: Connection[];
  configs: Config[];
};

export type moduleType = 'Analyser' | 'Clock' | 'Compressor' | 'Debugger' | 'Delay' | 'Drive' | 'Env' | 'Filter' | 'LFO' | 'Mixer' | 'Node' | 'NoteIn' | 'OSC' | 'Reverb' | 'VCA' | 'VCF';

type RackUnit = {
  id: number;
  type: moduleType;
  col: number;
  row: number;
  w?: number;
  h?: number;
  x: number;
  y: number;
};

// interface MasterOut extends RackUnit {
//   type: 'MasterOut',
//   id: 0;
//   x: 0;
//   y: 0;
// }

// type MasterOut = Pick<RackUnit, 'type'|'id'> {
//   type: 'MasterOut';
//   id: 0;
//   x: 0;
//   y: 0;
// };


export type Module = RackUnit; //| MasterOut;

// all in one:
type Module_ = RackUnit & SynthNode;


// A reference to the rendered node (ie. in the APP)
//  * with webaudio inlets/outlets
//  * also includes coords?
export type SynthNode = {
  inlets?: Inlet[];
  outlets?: Outlet[];
};



// interface Settings ?
export interface Config {
  name: string;
  parameters: Parameters;
}

export type parameterLabel = `${Module['id']}-${string}`;
export type Parameters = Record<parameterLabel, string|number>;



export type Connection = {
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
export type Inlet = {
  // data: () => void | audio: AudioNode;
  audio?: AudioNode; ///   audioNode: any; // webaudioNOde / elementary node / tone class / etc
  data?: () => void;
  label?: string;
  desc?: string;
}

export type Outlet = {
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