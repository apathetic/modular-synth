import { PatchState, Module, Connection, ParameterSet, Parameter } from '../../types/';

// these should be mapState:
export const connections = (state: PatchState): Connection[] => state.connections;
export const parameterKey = (state: PatchState): number => state.parameterKey;
export const parameterSets = (state: PatchState): ParameterSet[] => state.parameterSets;

// getters
export const module = (state: PatchState) => (id: number): Module | {} => {
  return state.modules.find((m) => m.id === id) || {};
};
export const modules = (state: PatchState): Module[] => state.modules.filter((m) => m.id !== 0);
export const parameters = (state: PatchState): Parameter[] => (
    parameterSets[state.parameterKey] &&
    parameterSets[state.parameterKey].parameters || []);


export const parametersName = (state: PatchState) => {
  const key = state.parameterKey;

  return (state.parameterSets[key] && state.parameterSets[key].name) || '';
};

export const activeModule = (state, getters) => getters.modules.find((m) => m.id === state.active);
export const bounds = (state, getters) => getters.modules.reduce((max, mod) => Math.max(max, mod.x), 0);
