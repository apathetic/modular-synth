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

export interface UserState {
  session: Session;
}

export interface PatchState {
  id: string;
  i: PatchKey;
  name: string;
  modules: Module[];
  connections: Connection[];
  configs: Config[];
}
export type Patch = PatchState;

export interface Connection {
  id: number;
  from: {
    id: number;
    port: number;
  };
  to: {
    id: number;
    port: number;
  };
}

export type moduleType = 'Analyser' | 'Clock' | 'Compressor' | 'Debugger' | 'Delay' | 'Drive' | 'Env' | 'Filter' | 'LFO' | 'Mixer' | 'Node' | 'NoteIn' | 'OSC' | 'Reverb' | 'VCA' | 'VCF';

interface MasterOut { type: 'MasterOut', id: 0, x: 0, y: 0 }
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
export type Module = Unit | MasterOut;


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

export interface Config {
  name: string;
  parameters: Parameters;
}

export type parameterLabel = `${Module['id']}-${string}`;
export type Parameters = Record<parameterLabel, string|number>;


export interface Inlet {
  // data: () => void | audio: AudioNode;
  audio?: AudioNode;
  data?: () => void;
  label?: string;
  desc?: string;
}

export interface Outlet {
  data?: () => void;
  audio?: AudioNode;
  label?: string;
  desc?: string;
}
