import { defineStore } from 'pinia'
// import * as getters from './getters';
// import * as actions from './actions';
import { state as blank } from '../patch';
// import type { AppState } from '@/types';



import type {
  AppState,
  Patch,
  Config,
  Connection,
  Parameters,
  parameterLabel,
  MouseCoords, GridCoords,
  Module, Node } from '@/types';


import { nextTick } from 'vue';
import { log } from '@/utils/logger';
import { fetch, create, save, remove } from '@/utils/supabase';
import { validateData } from '@/utils/validatePatch';
import { moduleSize } from '@/constants';








const patches = JSON.parse(localStorage.getItem('patches') || 'null');
// validateData(patches);

const state = () => <AppState>{
  power: false,
  isEditing: false,
  focusedId: undefined, // todo --> hoveredId
  activeId: 0,
  patches: patches || [blank()],

  // This is to prevent loading a patch on initial load. If this happens,
  // computed getters, etc. run once, before the `loadPatch` action is called
  // (from `PatchManager`).  This, in turn, mounts a bunch of <Connection>`s
  // that then try to reconcile and connect to (non-existant) audio nodes.
  patchId: -1, // 0 // id of the active patch

  // todo ==> settingsId ?
  configId: 0, // id of the active parameter configuration

  registry: {},

  session: undefined,
  // authenticated: false,
  // canvasOffset: 0,    // UI stuffs
};

export const useAppStore = defineStore('app', {
  state,

  getters: {


    // -----------------------------------------------
    //  SYNTH
    // -----------------------------------------------

    patch(state): Patch {
      // return !~state.patchId ? blank() : state.patches[state.patchId];

      const p = state.patches[state.patchId];
      // THERE MUST ALWAYS BE A PATCH.
      // if (!p) { throw new Error('fatal: there is no patch'); }
      return p || blank();
    },

    modules(): Module[] {
      // THERE WILL ALWAYS BE AT LEAST ONE MODULE: masterout
      return this.patch.modules;
    },

    activeModule(state: AppState): Module | undefined {
      return this.modules.find((module) => module.id === state.activeId);
    },

    /** deprecated. Use above */
    active(state: AppState): Module | undefined {
      return this.modules.find((module) => module.id === state.activeId);
    },

    focused(state: AppState): Module | undefined {
      return this.modules.find((module) => module.id === state.focusedId);
    },

    getModule(): Function {
      return (id: number): Module | undefined => (
        this.modules.find((module) => module.id === id)
      );
    },

    connections(): Connection[] {
      return this.patch.connections;
    },

    configs(): Config[] {
      return this.patch.configs;
    },

    config(state): Config {
      return this.configs[state.configId] || [];
    },

    parameters(): Parameters {
      return this.config?.parameters || {};
    },


    // -----------------------------------------------
    //  USER
    // -----------------------------------------------

    isAuthenticated (state: AppState): Boolean {
      return !!state.session;
    },


    /** deprecated. Use below */
    node: (state: AppState) => (id: number): Node => state.registry[id],

    ///////////
    getNode: (state: AppState) => (id: number): Node => state.registry[id],

    bounds(): number {
      return this.modules.reduce((max, module) => Math.max(max, module.x), 0);
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
      // const { resetSorting } = useSortable();

      if (id === this.patchId) { return; }
      // id = id ?? this.patchId as number;


      const connections = this.patches[id].connections; // keep a ref to the _soon-to-be-loaded_ connections array
      const configs = this.patches[id].configs;         // keep a ref to the _soon-to-be-loaded_ parameter configs
      this.patches[id].connections = [];                // temporarily zero it out
      this.patches[id].configs = [];                    // temporarily zero it out

      this.patchId = id;                                // trigger loading a new patch
      this.configId = 0;                                // select 1st set when new patch loaded
      log({ type:'patch', action:'loading ', data: this.patch.name });

      // ensure AudioNodes have been instantiated before proceeding with routing
      // ensure components w/ parameters have mounted before applying parameter configs
      await nextTick();

      this.patch.connections = connections;
      this.patch.configs = configs;
      // resetSorting();

    },

    /**
     * Save the current working patch into the backend database
     // Maybe persist it into localstorage too?
     * @this {Store} reference to the pinia store
     */
    savePatch() {
      const patch = this.patch;

      save({ ...patch /*, id: patch.uuid */ })
        .then(() => {
          console.log('saved: ', patch.name);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    /**
     * Insert a new, blank patch into the workspace.
     * @this Store The Vue (pinia) store instance.
     */
    addPatch () {
      this.patchId = this.patches.push(blank()) - 1;
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
      log({ type:'patch', action:'deleting', data: this.patch.name });

      // remove(this.patch._uuid);

      this.patches.splice(id, 1);
      this.patchId = 0;
      this.loadPatch(); // loadPatch(0)
    },

    /**
     * Fetch all of the user's patches from the API
     */
    async fetchPatches() {
      try {
        const patches = await fetch(); //// api.load('/patches').then((patches) => {
        console.log('%c Patches synched from API ', 'background:#666;color:white;font-weight:bold;');
        // this.patches = validateData(patches);
      } catch (err) {
        console.log('Not signed in.', err);
      }
    },


    // -----------------------------------------------
    //  APP
    // -----------------------------------------------

    togglePower() { this.power = !this.power; },
    toggleMode() { this.isEditing = !this.isEditing; },
    setActive(id: number) { this.activeId = id; },
    clearActive() { this.activeId = undefined; },
    setFocus(id: number) { this.focusedId = id; },
    clearFocus() { this.focusedId = undefined; },



    // better name: MODULES? MODULEREGISTRY ...?  WEBAUDIO_NODES?
    addToRegistry({ id, node }) { this.registry[id] = node; },
    removeFromRegistry (id) { delete this.registry[id]; },


    // -----------------------------------------------
    //  UI
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
      const module = this.modules.find((m) => m.id === data.id); /// this.getModule(data.id)

      if (module) {
        module.col = data.col;
        module.row = data.row;
      }
    },


    // export const UPDATE_SCROLL_OFFSET = (state, data) => {
    //   state.canvasOffset = data;
    // };



    // -----------------------------------------------
    //  PATCH
    // -----------------------------------------------

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
      const { activeId, focusedId, modules, connections } = this;

      // only delete active/focusedId modules
      if (activeId === focusedId) {
        try {
          this.patch.modules = modules.filter((m) => m.id !== activeId);
        } catch (e) {
          console.log('why', e)
        }

        connections.forEach((connection) => {
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
      patch.connections = connections.filter((c) => c.id !== id);
    },


    // -----------------------------------------------
    //  PARAMETERS
    // -----------------------------------------------

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
      console.log('remoeing', id);
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
