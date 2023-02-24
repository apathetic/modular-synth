
export interface AppState {
  power: boolean;
  isEditing: boolean;
  focusedId: number | undefined; // "hovered": for Module Info, Connections
  activeId: number | undefined;  // "clicked": for dragging, deleting.  ...activeModule?

  patches: Patch[];  // all available patches
  patchKey: number;  // key of active patch.  activePatch? currentPatch?
  configKey: number; // key of active params. activeconfig?

  // nodes..?
  // references to all audio nodes in the current patch.
  // Nodes/Modules are kinda conflated / they share the same `this` instance ... :(
  registry: {[value: number]: Node};

  session: any;

  // UI: STUFFS
  canvasOffset: number;
}

type PatchKey = string; // uuid/etc/...
export interface Patch {
  id: PatchKey;
  name: string;
  modules: Module[];
  connections: Connection[];
  configs: Config[];
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

export type parameterLabel = `${Module.id}-${string}`;
export interface Parameters {
  [parameterLabel]: string | number;
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
