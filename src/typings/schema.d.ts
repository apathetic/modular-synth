/**
 * Provides definitions for API structure
 */

 /*
const Schema = {
  type: Object,
  properties:  {
    "name" : {
      type: String,
    },
    "id" : {
      type: Integer
    },
    "connections" : {
      type: Array,
      items: {
        type: Object,
        properties: {
          "id" : 21,
          "from" : {
            "id" : 20,
            "port" : 0
          },
          "to" : {
            "id" : 0,
            "port" : 0
          }
        }
      }
    },
    "modules" : {
      type: Array,
      items: {
        "id" : Integer
        "type" : String,
        "col" : 0,
        "row" : 1,
        "w" : 4,
        "h" : 1,
        "x" : 291,
        "y" : 220
      }
    }
    "parameterSets" : {
      type: Array,
      items: {
        type: Object,
        properties: {
          "name" : {
            type: String
          },
          "parameters" : {
            type: Mixed
          }
        }
      }
    }
  }
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
