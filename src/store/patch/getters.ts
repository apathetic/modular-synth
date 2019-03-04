import { PatchState, Module, Connection, ParameterSet, Parameter } from '../../types/';

// these should be mapState:
export const connections = (state: PatchState): Connection[] => state.connections;
export const parameterKey = (state: PatchState): number => state.parameterKey;
export const parameterSets = (state: PatchState): ParameterSet[] => state.parameterSets;

// getters
export const module = (state: PatchState) => (id: number): Module | undefined => state.modules.find((m) => m.id === id);
export const modules = (state: PatchState): Module[] => state.modules.filter((m) => m.id !== 0);
export const parameters = (state: PatchState, getters): Parameter[] => {
  return (
    (getters.parameterSets[state.parameterKey] &&
      getters.parameterSets[state.parameterKey].parameters) ||
    []
  );
};
