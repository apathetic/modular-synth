import type { Session } from "@supabase/supabase-js";

type PatchKey = any; // string; // uuid; // string

export interface AppState {
  power: boolean;
  isEditing: boolean;
  focusedId: number | undefined; // "hovered": for Module Info, Connections
  activeId: number | undefined;  // "clicked": for dragging, deleting.  ...activeModule?

  patches: Patch[]; // all available patches
  patchId: number;  // active patch id
  configId: number; // active config id

  // nodes..?
  // references to all audio nodes in the current patch.
  // Nodes/Modules are kinda conflated / they share the same `this` instance ... :(
  registry: {[value: number]: Node};

  session: Session | undefined; // any;

  // UI: STUFFS
  canvasOffset?: number;
}

// export interface UserState {
//   session: Session;
// }

export interface Patch {
  id: string;
  i: PatchKey;
  name: string;
  modules: Module[];
  connections: Connection[];
  configs: Config[];
}

// for legacy types:
export type PatchState = Patch & {
  activeId?: number;
  hoveredId?: number;
  configId: number;
};


export type moduleType = 'Analyser' | 'Clock' | 'Compressor' | 'Debugger' | 'Delay' | 'Drive' | 'Env' | 'Filter' | 'LFO' | 'Mixer' | 'Node' | 'NoteIn' | 'OSC' | 'Reverb' | 'VCA' | 'VCF';

interface Unit {
  id: number;
  type: moduleType;
  col: number;
  row: number;
  w?: number;
  h?: number;
  x: number;
  y: number;
}

interface MasterOut extends Unit {
  type: 'MasterOut',
  id: 0,
  x: 0,
  y: 0;
}

export type Module = Unit; //| MasterOut;


// Node //   Node (object with coords, webaudio inlets/outlets)
// A reference to the rendered node (ie. in the APP)
//  * with webaudio inlets/outlets
//  * also includes coords?
export interface Node {
  name: string;
  // coords: { x: number, y: number };
  // inlets?: Inlet[];
  // outlets?: Outlet[];
  node: {
    inlets?: Inlet[];
    outlets?: Outlet[];
  };
}



type Node_ = {
    inlets?: Inlet[];
    outlets?: Outlet[];
}

type Module_ = Unit & Node_;








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