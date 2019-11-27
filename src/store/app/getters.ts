import { AppState, Node } from '@/types/';

// these shoud use mapState
export const patches = (state) => state.patches;
export const power = (state) => state.power;
export const editing = (state) => state.editing;
export const focused = (state) => state.focused;

// these are getters
// export const activeModule = (state, getters) => {
//  getters.modules.find((module) => module.id === state.active);
export const activeModule = (state, getters, rootState, rootGetters) => {
  return rootGetters['patch/modules'].find((module) => module.id === state.active);
};

export const bounds = (state, getters, rootState, rootGetters) => {
  return rootGetters['patch/modules'].reduce((max, mod) => Math.max(max, mod.x), 0);
};

/**
 * Fetches a `Node` (i.e. an AudioNode wrapper object) from the registry, by `id`.
 * @param {AppState} state The application state.
 * @return {Function} A function accepting an `id` of the node to return.
 */
export const node = (state: AppState) => (id: number): Node => {
  return state.registry[id];
};
