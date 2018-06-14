import { PatchState, Module, Connection, ParameterSet, Parameter } from '../../types/';

export const module = (state: PatchState) => (id: number): Module | undefined => state.modules.find((m) => m.id === id);
export const modules = (state: PatchState): Module[] => state.modules.filter((m) => m.id !== 0);
export const connections = (state: PatchState): Connection[] => state.connections;
export const parameterKey = (state: PatchState): number => state.parameterKey;
export const parameterSets = (state: PatchState): ParameterSet[] => state.parameterSets;
export const parameters = (state: PatchState): Parameter[] => (
    parameterSets[state.parameterKey] &&
    parameterSets[state.parameterKey].parameters || []);
