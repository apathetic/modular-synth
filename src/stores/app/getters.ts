import type { AppState, Patch, Config, Connection, Parameters, Module, Node } from '@/types';


// -----------------------------------------------
//  SYNTH
// -----------------------------------------------

/**
 * note to future self: avoid returning safe "default" values, here
 * ie. " ..|| {}" or  " .. || []".  Here, you'd have a ref to an empty (anon)
 * [] or {}, but one that doesn't live on `patch` or in the state.
 */

// THERE MUST ALWAYS BE A PATCH.
export function patch (state: AppState): Patch {
  const p = state.patches[state.patchId];
  if (!p) { throw new Error('fatal: there is no patch'); }
  return p;
}

// THERE WILL ALWAYS BE AT LEAST ONE MODULE: masterout
export function modules (state: any): Module[] {
  return state.patch.modules;
}

// export const module = (state) => {
export function activeModule (state: any): Module | undefined {
  return state.modules.find((module) => module.id === state.activeId);
}
export function active (state): Module | undefined {
  return state.modules.find((module) => module.id === state.activeId);
}
export function focused (state): Module | undefined {
  return state.modules.find((module) => module.id === state.focusedId);
}


export function getModule (state): Function {
  return (id: number): Module | undefined => (
    state.patch?.modules.find((m: Module) => m.id === id)
  );
}

export function connections (state): Connection[] {
  return state.patch.connections;
}

export function configs (state): Config[] {
  return state.patch.configs;
}

export function config (state): Config | undefined {
  return state.configs[state.configId];
}

export function parameters (state): Parameters {
  return state.config.parameters;
}



// -----------------------------------------------
//  USER
// -----------------------------------------------

export function isAuthenticated (state): Boolean {
  return !!state.session;
}






export const node = (state: AppState) => (id: number): Node => state.registry[id];
export const getNode = (state: AppState) => (id: number): Node => state.registry[id];

export function bounds (state) {
  return state.modules.reduce((max, module) => Math.max(max, module.x), 0);
}
