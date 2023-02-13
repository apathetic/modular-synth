// import { usePatchStore } from '@/stores/patch'
import type {
  AppState, Patch, Config,
  Connection,
  Parameter, Module, Node } from '@/types';



// -----------------------------------------------
//  SYNTH
// -----------------------------------------------

/**
 * note to future self: avoid returning safe "default" values, here
 * ie. " ..|| {}" or  " .. || []".  Here, you'd have a ref to an empty
 * [] or {}, but one that doesn't live on `patch` or in the state.
 */

export function patch (state: AppState): Patch | undefined {
  return state.patches[state.patchKey];
}

export function modules (state): Module[] | undefined {
  return this.patch?.modules;
}

// export const module = (state) => {
export function activeModule (state): Module | undefined {
  return this.modules.find((module) => module.id === state.activeId);
}
export function active (state): Module | undefined {
  return this.modules.find((module) => module.id === state.activeId);
}
export function focused (state): Module | undefined {
  return this.modules.find((module) => module.id === state.focusedId);
}


export function getModule (state): Function {
  return (id: number): Module | undefined => (
    state.patch?.modules.find((m) => m.id === id)
  );
}

export function connections (state): Connection[] {
  return this.patch?.connections || [];
}

export function configs (state): Config[] {
  return this.patch?.configs || [];
}

export function config (state): Config | undefined {
  return this.configs[state.configKey];
}

export function parameters (state): Parameter[] {
  // return this.config.parameters || [];
  return this.config?.parameters;
}



// -----------------------------------------------
//  USER
// -----------------------------------------------

export function isAuthenticated (state): Boolean {
  return !!state.session;
}







export function parametersName (state: PatchState) {
  return this.config?.name || '';
}

export const node = (state: AppState) => (id: number): Node => state.registry[id];
export const getNode = (state: AppState) => (id: number): Node => state.registry[id];
// export const node = (state: AppState) => this.modules[id].node;

export function bounds (state) {
  return this.modules.reduce((max, module) => Math.max(max, module.x), 0);
}
