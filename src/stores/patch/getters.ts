import type { PatchState, Module, Connection, ParameterSet, Parameter } from '@/types';

// these should be mapState:
// export const connections = (state: PatchState): Connection[] => state.connections;
// export const parameterKey = (state: PatchState): number => state.parameterKey;
// export const parameterSets = (state: PatchState): ParameterSet[] => state.parameterSets;


// export const modules = (state: PatchState): Module[] => state.modules.filter((m) => m.id !== 0);


export const module = (state: PatchState) => (id: number): Module | {} => {
  return state.modules.find((m) => m.id === id) || {};
};
export const parameters = (state: PatchState): Parameter[] => {
  return state.parameterSets[state.parameterKey]?.parameters || [];
};
export const parametersName = (state: PatchState) => {
  return (state.parameterSets[state.parameterKey]?.name) || '';
};
