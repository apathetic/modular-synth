import { defineStore } from 'pinia'
import { moduleSize } from '@/constants';
import type {
  PatchState,
  Patch,
  Config,
  Module,
  Connection,
  Parameters,
  parameterLabel,
  MouseCoords,
  GridCoords,
} from '@/types';





const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  });
};

const masterout = {
  type: 'MasterOut',
  id: 0,
  x: 0,
  y: 0,
} as unknown as Module;


// A.K.A. "blank" state
export const state = () => <Patch>{
  id: uuid(),
  i: 0, // keeps track of modules, augmented when new module is added. could use uuid maybe
  name: '<blank>',
  modules: [masterout],
  connections: [],
  configs: [{  // "settings ..?  parameterSets
    name: '<blank>',
    parameters: {}
  }]
};


export const usePatchStore = defineStore('patch', {
  state: () => <PatchState>{
    ...state(),
    activeId: undefined,
    hoveredId: undefined,
    configId: 0,
  },

  getters: {

    activeModule(state): Module | undefined {
      return this.modules.find((module) => module.id === state.activeId);
    },

    hoveredModule(state): Module | undefined {
      return state.modules.find((module) => module.id === state.hoveredId);
    },

    getModule(state): Function {
      return (id: number): Module | undefined => (
        state.modules.find((module) => module.id === id)
      );
    },

    config(state: PatchState): Config | undefined {
      return state.configs[state.configId];
    },

    parameters(): Parameters {
      return this.config?.parameters || {};
    },

  },

  actions: {

    updateGridPosition({ /* id, */ x, y }: MouseCoords) {
      // const module = state.modules.find((m) => m.id === id);
      if (this.activeModule) {
        this.activeModule.x = x;
        this.activeModule.y = y;
      }
    },

    updateRackPosition({ id, col, row }: GridCoords) {
      const module = this.getModule(id);

      if (module) {
        module.col = col;
        module.row = row;
      }
    },

    setActive(id: number) { this.activeId = id; },
    clearActive() { this.activeId = undefined; },
    setFocus(id: number) { this.hoveredId = id; },
    clearFocus() { this.hoveredId = undefined; },

    /**
     * Adds a new module to the patch.
     * @param {Object} data A partial serialized Module object
     * @param {string} data.type
     * @param {number} data.x
     * @param {number} data.y
     */
    addModule({ type, x, y }: Pick<Module, 'type'|'x'|'y'>) {

      const size = moduleSize[type] || [1, 1];

      this.i++;     // or uuid
      this.modules.push({
        id: this.i,
        type: type,
        x: x || 0,    // for dragging X position
        y: y || 0,    // for dragging Y position
        col: 0,       // for rack X position
        row: 0,       // for rack Y position
        w: size[0],   // for rack width
        h: size[1]    // for rack height
      } as Module);
    },

    /**
     * Removes (deletes) the currently _active_ module.
     */
    removeModule() {
      const { activeId, hoveredId } = this;

      // only delete active/hoveredId modules
      if (activeId === hoveredId) {
        try {
          this.modules = this.modules.filter((m) => m.id !== activeId);
        } catch (e) {
          console.log('why', e)
        }

        this.connections.forEach((connection) => {
          if (connection.to.id === activeId || connection.from.id === activeId) {
            this.removeConnection(connection.id);
          }
        });

        // Note: KNOB / SLIDERS will remove themselves, yay!
      }
    },

    /**
     * Adds a new connection between two modules, in the patch.
     * @param {Connection} data The serialized connection object
     */
    addConnection(data: Connection) {
      this.connections.push(data);
    },

    /**
     * Removes (deletes) a connection by its id.
     * @param {number} id The id of the connection to remove.
     */
    removeConnection(id: number) {
      this.connections = this.connections.filter((c) => c.id !== id);
    },

    /**
     * Adds an new parameter configuration.
     */
    addConfig() {
      const config = {
        name: '<empty>',
        parameters: Object.assign({}, this.config?.parameters)
      };

      this.configId = this.configs.push(config) - 1; // select new config (push returns array length)
    },

    /**
     * Removes a set of parameters.
     * @param {number} id The configuration to remove
     */
    removeConfig(id: number) {
      this.configs.splice(id, 1);
      this.configId = 0;
    },

    setParameter (data: { id: parameterLabel; value: Parameters[parameterLabel]}) {
      if (this.parameters) {
        this.parameters[data.id] = data.value;
      }
    },

    removeParameter (id: parameterLabel) {
      this.configs.forEach((config) => {
        delete config.parameters[id];
      });
    }

  }
});
