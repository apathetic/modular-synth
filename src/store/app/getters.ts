
// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

export const power = (state) => state.power;
export const editing = (state) => state.editing;
export const focused = (state) => state.focused;
export const patches = (state) => state.patches;
export const active = (state, getters) => getters.modules.find((module) => module.id === state.active);
export const bounds = (state, getters) => getters.modules.reduce((max, module) => Math.max(max, module.x), 0);
