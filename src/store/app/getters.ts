import { AppState } from '../../types/';

export const patches = (state: AppState) => state.patches;
export const power = (state: AppState) => state.power;
export const editing = (state: AppState) => state.editing;
export const focused = (state: AppState) => state.focused;
export const activeModule = (state: AppState, getters) => getters.modules.find((module) => module.id === state.active);
export const bounds = (state, getters) => getters.modules.reduce((max, module) => Math.max(max, module.x), 0);
