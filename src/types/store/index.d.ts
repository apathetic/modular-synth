
export interface RootState {
  app: AppState,
  patch: PatchState
}

export interface AppState {

  // APP: USER STATE
  power: boolean,
  editing: boolean,
  focused: undefined,                                // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: number,                                    // "Clicked": for Dragging, Deleting.

  // // PATCH: WORKING DATA                             // NOTE: data is populated in actions.js
  // id: 0,
  // name: '',
  // modules: x.Module[],
  // connections: [],
  // parameterSets: [],
  // parameterKey: 0,

  // APP: "PERSISTENT" STORAGE
  patchKey: string, // localStorage.getItem(_KEY) || '',        // key of active patch

  // UI: STUFFS
  canvasOffset: 0,

  // TODO: remove; use firebase + SW instead;
  patches: {}                                        // all available patches, cached here
}

export interface PatchState {
  id: number,
  name: string,
  modules: Module[],
  connections: Connection[],
  parameterSets: ParameterSet[],
  parameterKey?: number
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

export interface Module {
  id: number;
  type: string;
  col: number;
  row: number;
  w: number;
  h: number;
  x: number;
  y: number;
}

export interface ParameterSet {
  name: string;
  parameters: Parameter[];
}

// export type Parameter = (state: S, getters: any, rootState: R, rootGetters: any) => any;
export interface Parameter {
  [key: string]: string | number;
}
