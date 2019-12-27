// import Synth from '@/main';
import { AppState, Node } from '@/types/';

// these shoud use mapState
export const patches = (state) => state.patches;
export const power = (state) => state.power;
export const editing = (state) => state.editing;
export const focused = (state) => state.focused;

// these are getters
export const activeModule = (state, getters) => getters.modules.find((module) => module.id === state.active);
export const bounds = (state, getters) => getters.modules.reduce((max, module) => Math.max(max, module.x), 0);
export const node = (state: AppState) => (id: number): Node => {
  return state.registry[id];
}