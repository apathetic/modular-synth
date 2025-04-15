import { defineStore } from 'pinia'
import { state as emptyPatch } from '../patch';

import { nextTick } from 'vue';
import { log } from '@/utils/logger';
import { /* fetch, create, */ save, /* remove */ } from '@/utils/supabase';
import { /* validateData, */ fixPatch, isPatch } from '@/utils/validatePatch';
import { moduleSize } from '@/constants';
import type { AppState, RackUnit, SynthNode, MouseCoords, GridCoords } from '@/types/globals';
// import type {  MasterOut, Module } from '@/types/generated';


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
     * The `id` of the active preset
		 * @type {number}
     */
    presetId: 0,

    /**
     * Stores the patch's active `AudioNode`s
     * @type {Record<number, SynthNode>}
     *
     * Modules (UI) are serializeable, and stored as JSON.
     * Nodes (audio) are determined at run-time, and stored in the registry.
     */
    registry: {},

    session: undefined,
    // authenticated: false,


    patch: { modules: [], connections: [], presets: [{ name: 'loading...' }], name: 'loading...' } as unknown as Patch,

  },

  getters: {


    // -----------------------------------------------
    //  SYNTH
    // -----------------------------------------------

    modules(): Module[] {
      // masterOut needs to be included as this.modules is used when connecting modules
      return this.patch.modules as Module[];
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
      return this.patch.loaded ? this.patch.connections : [];
    },

    presets(): Preset[] {
      return this.patch.loaded ? this.patch.presets : [{ name: 'loading...' } as Preset];
    },

    preset(state): Preset {
      const preset = this.presets?.[state.presetId];
      if (!preset) {
        throw new Error(`No preset found at index ${state.presetId}`);
      }

      return this.presets[state.presetId];
    },

    parameters(): Record<parameterLabel, string | number> {
      return this.preset?.parameters || {};
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

    isAuthenticated (state): boolean {
      // return !!state.session;
      return true;
    },

    bounds(): number {
      return this.modules.reduce((max: number, module: Module) => Math.max(max, module.x), 0);
    }
  },

  actions: {

    // -----------------------------------------------
    //  APP
    // -----------------------------------------------

    toggleMode() { this.isEditing = !this.isEditing; },


    // -----------------------------------------------
    //  LOAD / SAVE
    // -----------------------------------------------

    /**
     * Loads and instantiates a patch from the Store. This includes setting up
     * `modules`, `presets`, routing audio, and applying any `parameters`.
     *
     * NOTE: we cannot load `modules`, `connections`, and `parameters` all at once.
     *       Modules must be mounted first so that all AudioNodes are available
     *       to the `connections`; likewise the `presets` need to be available
     *       before `parameters` are instantiated.
     *
     * @this {Store} reference to the pinia store
     * @param {number} id The id of the patch to load
     */
    async loadPatch(id: number) {

      if (id === this.patchId && this.patch.loaded) {
        return;
      }

      if (!isPatch(this.patches[id])) {
        console.error('Invalid patch at index', id);
      }

      const patch = this.patches[id];
      log({ type:'patch', action:'loading ', data: patch.name });

      patch.loaded = false;

      this.patch = patch;
      this.patchId = id;
      this.presetId = 0;                     // select 1st set when new patch loaded

      // ensure AudioNodes have been instantiated before proceeding with routing Connections
      await nextTick();

      // Now we can safely instantiate connections
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
      this.presetId = 0;
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
     * @param {moduleType} data.type
     * @param {number} data.x
     * @param {number} data.y
     */
    addModule(data: Pick<Module, 'type'|'x'|'y'>) {
      const { type, x, y } = data;
      const patch = this.patch;
      const size = moduleSize[type as moduleType] || [1, 1];

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
    addPreset() {
      const preset = {
        name: '<empty>',
        parameters: Object.assign({}, this.preset?.parameters)
      };

      this.presetId = this.presets.push(preset) - 1; // select new preset by default (push returns array length)
    },

    /**
     * Remove a set of parameters.
     * @param {number} id The configuration to remove
     */
    removePreset(id: number) {
      if (this.presets.length <= 1) {
        console.warn('Cannot remove last preset');
        return;
      }

      log({ type:'patch', action:'deleting preset', data: id });
      this.presets.splice(id, 1);
      this.presetId = 0;
    },

    setParameter (data: { id: parameterLabel; value: string | number }) {
      if (this.parameters) {
        this.parameters[data.id] = data.value;
      }
    },

    removeParameter (id: parameterLabel) {
      this.presets.forEach((preset: Preset) => {
        delete preset.parameters[id];
      });
    }

  }
});


const localPatches = JSON.parse(localStorage.getItem('patches') || 'null');
const patches = localPatches || [emptyPatch()];

export const useAppStore = createAppStore({ patches });
