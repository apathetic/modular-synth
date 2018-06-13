import { PatchState, Module, Parameter } from '../../types/store/';

export const module = (state: PatchState) => (id: number) => state.modules.find((m) => m.id === id);
export const modules = (state: PatchState) => state.modules.filter((m) => m.id !== 0);
export const connections = (state: PatchState) => state.connections;
export const parameterKey = (state: PatchState) => state.parameterKey;
export const parameterSets = (state: PatchState) => state.parameterSets;
export const parameters = (state: PatchState) => (
    state.parameterSets[state.parameterKey] &&
    state.parameterSets[state.parameterKey].parameters || []);

// export const parameters: Parameter[] = (state) => (
//     parameterSets[parameterKey] &&
//     parameterSets[parameterKey].parameters || []);
