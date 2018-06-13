
export const patches = (state) => state.patches;
export const power = (state) => state.power;
export const editing = (state) => state.editing;
export const focused = (state) => state.focused;
export const active = (state, getters) => getters.modules.find((module) => module.id === state.active); // NOTE: this returns a module, but state.active is an `id`
export const bounds = (state, getters) => getters.modules.reduce((max, module) => Math.max(max, module.x), 0);
