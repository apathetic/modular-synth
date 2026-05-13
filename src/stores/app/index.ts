import { defineStore } from 'pinia'
import { nextTick } from 'vue';
import { log } from '~/utils/logger';
import { emptyPatch } from '~/synths/empty';
// import { /* fetch, create, */ save, /* remove */ } from '~/utils/db';
import { fixPatch, isPatch } from '~/utils/validatePatch';
import { loadPatches, defaultPatches, clearStorage } from '~/utils/persistence';
import { registry } from '~/audio/registry';
import { MASTER_ID } from '~/audio/master';
import { moduleSize } from '~/constants';
import type { AppState, RackUnit, MouseCoords, GridCoords } from '~/types/globals';
// import type {  MasterOut, Module } from '~/types/generated';


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
     * The patch currently being edited
     * @type {Patch}
     *
     * Live `AudioNode`s associated with `patch.modules` live in the
     * module-level `registry` (`~/audio/registry`) — NOT in Pinia state —
     * because audio handles aren't serializable and don't need reactivity.
     */
    patch: emptyPatch(),


    session: undefined,
    // authenticated: false,
  },

  getters: {


    // -----------------------------------------------
    //  SYNTH
    // -----------------------------------------------

    /**
     * Get all modules, including MasterOut. Use `rackModules` when you want
     * only user-placed modules.
     */
    modules(): Module[] {
      return this.patch.modules as Module[];
    },

    /**
     * Rack-renderable modules — i.e. everything except the MasterOut
     */
    rackModules(): Module[] {
      return this.modules.filter((m: Module) => m.id !== MASTER_ID);
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

    parameters(): ParameterMap {
      return this.preset?.parameters || {};
    },

    /**
     * Resolve a single parameter value for the active preset. Safe to call
     * while the patch is still loading — the `presets` getter returns a
     * stub without a `parameters` field until `patch.loaded` flips true.
     */
    getParameter() {
      return (moduleId: number, name: string): ParameterValue | undefined => (
        this.preset?.parameters?.[moduleId]?.[name]
      );
    },

    getNode: () => (id: number) => registry.get(id),

    /**
     * Returns a RackUnit that combines Module and SynthNode as separate properties
     * This provides a single entity representation of a module in the rack
     */
    getRackUnit() {
      return (id: number): RackUnit | undefined => {
        const module = this.modules.find((mod: Module) => mod.id === id);
        const node = registry.get(id);

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

    isAuthenticated (_state): boolean {
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
        console.error('Invalid patch at index', id, '- attempting repair');
        try {
          this.patches[id] = fixPatch(this.patches[id]);
        } catch {
          this.patches[id] = emptyPatch();
        }
      }

      // Mark the outgoing patch unloaded before swapping so re-entry on the
      // same index (e.g. after a repair) doesn't hit the guard at the top.
      this.patch.loaded = false;

      const patch = this.patches[id];
      log({ type:'patch', action:'loading', data: `"${patch.name}"` });

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
      // const patch: Patch = isPatch(this.patch) ? this.patch : fixPatch(this.patch);

      // save({ ...patch /*, id: patch.uuid */ })
      //   .then(() => {
      //     console.log('saved: ', patch.name);
      //   })
      //   .catch((err) => {
      //     console.log(err);
      //   });
    },

    /**
     * Insert a new, emptyPatch patch into the workspace and load it.
     * @this {Store} reference to the pinia store
     */
    addPatch () {
      const idx = this.patches.push(emptyPatch()) - 1;
      this.patch.loaded = false;
      this.loadPatch(idx);
    },

    /**
     * Reset the workspace to the shipped default patches (DX7 first, Basic
     * second) and wipe any persisted patches from localStorage. Intended for
     * dev use.
     * @this {Store} reference to the pinia store
     */
    clear() {
      log({ type:'system', action:'clear', data:'resetting patches' });
      this.patches = defaultPatches();
      this.patchId = 0;
      this.presetId = 0;
      registry.clear();
      this.patch = this.patches[0];
      clearStorage();
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
      if (activeId === hoveredId && activeId !== undefined) {
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

        // Drop the module's parameter bucket from every preset. Knobs also
        // clean up their own leaves on unmount, but doing it here keeps the
        // graph consistent even if parameters were set without a live knob.
        this.patch.presets.forEach((preset: Preset) => {
          delete preset.parameters[activeId];
        });
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
     * Adds a new, empty preset object. The new object inherits the current
     * preset's values as a deep copy.
     */
    addPreset() {
      const source: ParameterMap = this.preset?.parameters ?? {};
      const parameters: ParameterMap = {};
      for (const [moduleId, bucket] of Object.entries(source)) {
        parameters[Number(moduleId)] = { ...bucket };
      }

      const preset: Preset = { name: '<empty>', parameters };

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

    /**
     * Write a parameter value into the currently-selected preset. Only ever
     * called from user interaction (knob drag, dropdown select), by which
     * point the patch is loaded and the preset exists.
     */
    setParameter(data: { moduleId: number; param: string; value: ParameterValue }) {
      const preset = this.patch.presets[this.presetId];
      const bucket = preset.parameters[data.moduleId] ?? (preset.parameters[data.moduleId] = {});

      let val = data.value;
      if (typeof val === 'number') {
        val = Math.round(val * 1000) / 1000; // 3 decimals max
      }
      bucket[data.param] = val;
    },

    /**
     * Remove a single parameter leaf from every preset. Cleans up the owning
     * module bucket when it becomes empty. Called from knob unmount on
     * module deletion, and also (harmlessly) on patch switch — the target
     * keys simply don't exist in the incoming patch's presets.
     */
    removeParameter(data: { moduleId: number; param: string }) {
      this.patch.presets.forEach((preset: Preset) => {
        const bucket = preset.parameters[data.moduleId];
        if (!bucket) return;

        delete bucket[data.param];

        if (Object.keys(bucket).length === 0) {
          delete preset.parameters[data.moduleId];
        }
      });
    }

  }
});


const patches = loadPatches();

export const useAppStore = createAppStore({ patches });
