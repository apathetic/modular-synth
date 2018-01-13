/**
 * Provides definitions for API structure
 */

export interface API<S> {
  name: string;
  id: number;
  connections: Connection[];
  modules: Module[];
  parameterSets: ParamterSet[];
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

export interface ParamterSet {
  name: string;
  parameters: Parameter[];
}

// export type Parameter = (state: S, getters: any, rootState: R, rootGetters: any) => any;
export interface Parameter {
  [key: string]: string | number;
}
