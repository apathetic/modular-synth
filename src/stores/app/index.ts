import { defineStore } from 'pinia'
import { state as emptyPatch, masterout } from '../patch';
import type {
  AppState,
  Patch,
  Config,
  Connection,
  Parameters,
  parameterLabel,
  MouseCoords,
  GridCoords,
  Module,
  SynthNode,
  RackUnit } from '@/types';


import { nextTick } from 'vue';
import { log } from '@/utils/logger';
import { fetch, create, save, remove } from '@/utils/supabase';
import { validateData, fixPatch, isPatch } from '@/utils/validatePatch';
import { moduleSize } from '@/constants';





// const rawPatches = JSON.parse(localStorage.getItem('patches') || 'null');
// const patches = validateData(rawPatches);


export const createAppStore = ({ patches }: { patches: Patch[] }) => defineStore('app', {
  state: () => <AppState>{
    power: false,
    isEditing: false,
    hoveredId: undefined,
    activeId: undefined,
    patches: patches,

    /**
     * The `id` of the active patch
		 * @type {number}
     */
    patchId: 0,

    /**
     * The `id` of the active parameter configuration
		 * @type {number}
     *
     * [TODO] : consider renaming to settingsId ...?
     */
    configId: 0,

    /**
     * Stores the patch's active `AudioNode`s
     * @type {Record<number, SynthNode>}
     *
     * -- Temporary(?) hack --
     * Modules (UI) are serializeable, and stored as JSON.
     * Nodes (audio) are determined at run-time, and stored in the registry.
     * Ideally, there'd be a single data-type to encapsulate both (i.e. a
     * computed getter would be an obvious choice), but at present `nodes` and
     * `modules` are assembled via `getNode` and `getModule` into a single obj
     */
    registry: {},

    session: undefined,
    // authenticated: false,


    patch: { modules: [], connections: [], configs: [], name: 'loading...' } as unknown as Patch,

  },

  getters: {


    // -----------------------------------------------
    //  SYNTH
    // -----------------------------------------------

    patchXXX(state): Patch {
      if (!state.patches.length) {
        throw new Error('No patches found');
      }

      // if (!state.patchId) {
      //   console.log('patch not loaded');
      //   return { modules: [], connections: [], configs: [], name: 'loading...' } as unknown as Patch;
      // }


      const p = state.patches[state.patchId];

      if (!p || !isPatch(p)) {
        throw new Error('Invalid patch at index ' + state.patchId);
      }

      if (!p.loaded) {
        console.log('patch not loaded');
        // return { modules: [], connections: [], configs: [], name: 'loading...' } as unknown as Patch;
      }

      return p;
    },

    modules(): Module[] {
      // return this.patch.loaded ? this.patch.modules : [masterout];
      // return this.patches.length ? this.patch.modules : [];

      // THERE WILL ALWAYS BE AT LEAST ONE MODULE: masterout
      return this.patch.modules;
    },

    activeModule(state): Module | undefined {
      return this.modules.find((module: Module) => module.id === state.activeId);
    },

    /** deprecated. Use above */
    active(state): Module | undefined {
      return this.modules.find((module: Module) => module.id === state.activeId);
    },

    focused(state): Module | undefined {
      return this.modules.find((module: Module) => module.id === state.hoveredId);
    },

    getModule(): Function {
      return (id: number): Module | undefined => (
        this.modules.find((module: Module) => module.id === id)
      );
    },

    connections(): Connection[] {
      return this.patch.connections;
    },

    configs(): Config[] {
      return this.patch.configs;
    },

    config(state): Config {
      const config = this.configs?.[state.configId];
      if (!config) {
        throw new Error(`No config found at index ${state.configId}`);
      }

      return this.configs[state.configId];
    },

    parameters(): Record<parameterLabel, string | number> {
      return this.config?.parameters || {};
    },

    getNode: (state) => (id: number) => state.registry[id],

    /**
     * Returns a RackUnit that combines Module and SynthNode as separate properties
     * This provides a single entity representation of a module in the rack
     */
    getRackUnit() {
      return (id: number): RackUnit | undefined => {
        const module = this.modules.find((mod: Module) => mod.id === id);
        const node = this.registry[id];

        if (!module || !node) return undefined;

        return {
          id,
          module,
          node
        };
      };
    },


    // -----------------------------------------------
    //  USER
    // -----------------------------------------------

    isAuthenticated (state): Boolean {
      return !!state.session;
    },

    bounds(): number {
      return this.modules.reduce((max: number, module: Module) => Math.max(max, module.x), 0);
    }
  },

  actions: {


    // -----------------------------------------------
    //  LOAD / SAVE
    // -----------------------------------------------

    /**
     * Loads and instantiates a patch from the Store. This includes setting up
     * `modules`, `configs`, routing audio, and applying any `parameters`.
     *
     * NOTE: we cannot load `modules`, `connections`, and `parameters` all at once.
     *       Modules must be mounted first so that all AudioNodes are available
     *       to the `connections`; likewise the `configs` need to be available
     *       before `parameters` are instantiated.
     *
     * @this {Store} reference to the pinia store
     * @param {number} id The id of the patch to load
     */
    async loadPatch(id: number) {
      console.log('loadPatch', id);

      // const { resetSorting } = useSortable();
      if (id === this.patchId) {
        if (this.patch.loaded) {
          return;
        }
      }
      // id = id ?? this.patchId as number;

      // Validate the patch before processing it
      if (!isPatch(this.patches[id])) {
        console.error('Invalid patch at index', id);
        // this.patches[id] = fixPatch(this.patches[id]);
      }

      // this.patches[this.patchId].loaded = false;        // reset the previous patch's loaded state



      // const connections = this.patches[id].connections; // keep a ref to the _soon-to-be-loaded_ connections array
      // const configs = this.patches[id].configs;         // keep a ref to the _soon-to-be-loaded_ parameter configs

      // this.patches[id].connections = [];                // temporarily zero it out so that it will not load immediately
      // this.patches[id].configs = [];                    // temporarily zero it out

      const patch = this.patches[id];
      const connections = patch.connections; // keep a ref to the _soon-to-be-loaded_ connections array
      const configs = patch.configs;         // keep a ref to the _soon-to-be-loaded_ parameter configs

      patch.loaded = false;
      patch.connections = [];
      patch.configs = [];

      this.patch = patch; //
      this.patchId = id;                                // trigger loading a new patch
      this.configId = 0;                                // select 1st set when new patch loaded

      log({ type:'patch', action:'loading ', data: patch.name });

      // ensure AudioNodes have been instantiated before proceeding with routing
      // ensure components w/ parameters have mounted before applying parameter configs


      await nextTick();
      console.log('connections and configs');

      // Now we can safely instantiate parameters and connections
      // this.patches[id].connections = connections;
      // this.patches[id].configs = configs;
      // this.patches[id].loaded = true;
      // resetSorting();

      this.patch.connections = connections;
      this.patch.configs = configs;
      this.patch.loaded = true;

    },

    /**
     * Save the current working patch into the backend database
     // Maybe persist it into localstorage too?
     * @this {Store} reference to the pinia store
     */
    savePatch() {
      // Validate the patch before saving
      // const patch = validatePatch(this.patch);
      const patch: Patch = isPatch(this.patch) ? this.patch : fixPatch(this.patch);

      save({ ...patch /*, id: patch.uuid */ })
        .then(() => {
          console.log('saved: ', patch.name);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    /**
     * Insert a new, emptyPatch patch into the workspace.
     * @this Store The Vue (pinia) store instance.
     */
    addPatch () {
      this.patchId = this.patches.push(emptyPatch()) - 1;
      this.configId = 0;
    },

    /**
     * Remove a patch.
     * @this {Store} reference to the pinia store
     * @param {number} id The id of the patch to load
     */
    removePatch(id?: number) {
      if (this.patches.length === 1) {
        alert('no');
        return;
      }

      id = id ?? this.patchId as number;
      log({ type:'patch', action:'deleting patch', data: this.patch.name });

      this.patches.splice(id, 1);
      this.loadPatch(0);
    },

    /**
     * Fetch all of the user's patches from the API
     */
    async fetchPatches() {
      try {
        ////

        // const patches = await fetch(); //// api.load('/patches').then((patches) => {
        // this.patches = validateData(patches);
        // console.log('%c Patches synched from API ', 'background:#666;color:white;font-weight:bold;');

      } catch (err) {
        console.log('Not signed in.', err);
      }
    },


    // -----------------------------------------------
    //  APP
    // -----------------------------------------------

    togglePower() { this.power = !this.power; },
    toggleMode() { this.isEditing = !this.isEditing; },


    // -----------------------------------------------
    //  PATCH
    // -----------------------------------------------

    updateGridPosition({ /* id, */ x, y }: MouseCoords) {
      // const module = state.modules.find((m) => m.id === data.id);

      // const module = this.getModule(id);
      // module.x = x;
      // module.y = y;

      if (this.activeModule) {
        this.activeModule.x = x;
        this.activeModule.y = y;
      }
    },

    updateRackPosition(data: GridCoords) {
      const module = this.modules.find((m: Module) => m.id === data.id); /// this.getModule(data.id)

      if (module) {
        module.col = data.col;
        module.row = data.row;
      }
    },

    addToRegistry({ id, node }: { id: number; node: SynthNode }) { this.registry[id] = node; },
    removeFromRegistry (id: number) { delete this.registry[id]; },
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
    addModule(data: Pick<Module, 'type'|'x'|'y'>) {
      const { type, x, y } = data;
      const patch = this.patch;
      const size = moduleSize[type] || [1, 1];

      patch.i++;     // or uuid
      patch.modules.push({
        id: patch.i,
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
      const { activeId, hoveredId, modules, connections } = this;

      // only delete active/hoveredId modules
      if (activeId === hoveredId) {
        try {
          this.patch.modules = modules.filter((m: Module) => m.id !== activeId);
        } catch (e) {
          console.log('why', e)
        }

        connections.forEach((connection: Connection) => {
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
      const { patch, connections } = this;
      patch.connections = connections.filter((c: Connection) => c.id !== id);
    },

    /**
     * Adds an new, empty parameter-configuration object.
     */
    addConfig() {
      const config = {
        name: '<empty>',
        parameters: Object.assign({}, this.config?.parameters)
      };

      this.configId = this.configs.push(config) - 1; // select new config by default (push returns array length)
    },

    /**
     * Remove a set of parameters.
     * @param {number} id The configuration to remove
     */
    removeConfig(id: number) {
      if (this.configs.length <= 1) {
        console.warn('Cannot remove last config');
        return;
      }

      log({ type:'patch', action:'deleting config', data: id });
      this.configs.splice(id, 1);
      this.configId = 0;
    },

    setParameter (data: { id: parameterLabel; value: string | number }) {
      if (this.parameters) {
        this.parameters[data.id] = data.value;
      }
    },

    removeParameter (id: parameterLabel) {
      this.configs.forEach((config: Config) => {
        delete config.parameters[id];
      });
    }

  }
});


const localPatches = JSON.parse(localStorage.getItem('patches') || 'null');
const patches = localPatches || [emptyPatch()];

export const useAppStore = createAppStore({ patches });
