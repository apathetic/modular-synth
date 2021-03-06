
export interface RootState {
  app: AppState;
  patch: PatchState;
}


export interface AppState {
  power: boolean;
  editing: boolean;
  focused: undefined;       // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: number;           // "Clicked": for Dragging, Deleting.
  registry: {[value: number]: Node};         // references to Node (object with coords, webaudio inlets/outlets)

  // APP: "PERSISTENT" STORAGE
  patchKey: string;         // key of active patch

  // UI: STUFFS
  canvasOffset: 0;

  // TODO: remove; use firebase + SW instead;
  patches: {};               // all available patches, cached here
}


export interface PatchState {
  id: number;
  name: string;
  modules: Module[];
  connections: Connection[];
  parameterSets: ParameterSet[];
  parameterKey: number;
}


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

// Data representing the RACK module (ie. in the PATCH)
export interface Module {
  id: number;
  type: string;
  col?: number;
  row?: number;
  w?: number;
  h?: number;
  x: number;
  y: number;
}
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


export interface ParameterSet {
  name: string;
  parameters: Parameter[];
}


// export type Parameter...?
export interface Parameter {
  [key: string]: string | number;
}

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
