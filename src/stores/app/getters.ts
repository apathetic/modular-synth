import { usePatchStore } from '@/stores/patch'
import type { AppState, Patch, Config, Parameter, Module, Node } from '@/types';


export function patch (state: AppState): Patch | undefined {
  return state.patches[state.patchKey];
}

export function configs (state): Config[] {
  return state.patch?.configs || [];
}

export function config (state): Config | undefined {
  return state.configs?.[state.configKey];
}

export function parameters (state): Parameter[] {
  // return this.configs.parameters || [];
  return config(state).parameters || [];
};

export function getModule (state): Function {
  return (id: number): Module | undefined => (
    state.patch?.modules.find((m) => m.id === id)
  );
};





export const parametersName = (state: PatchState) => {
  return (state.parameterSets[state.parameterKey]?.name) || '';
};

export const node = (state: AppState) => (id: number): Node => state.registry[id];


// move to PatchStore:
// export const activeModule = (state) => patchStore.modules.find((module) => module.id === state.active);
// export const bounds = (state) => patchStore.modules.reduce((max, module) => Math.max(max, module.x), 0);


export const activeModule = (state) => {
  const patchStore = usePatchStore();
  return patchStore.modules.find((module) => module.id === state.active);
}
export const bounds = (state) => {
  const patchStore = usePatchStore();
  return patchStore.modules.reduce((max, module) => Math.max(max, module.x), 0);
}