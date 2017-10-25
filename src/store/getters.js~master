// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

export const patches = (state) => state.patches;
export const parameterSets = (state) => state.parameterSets;

export const power = (state) => state.power;
export const editing = (state) => state.editing;
export const focused = (state) => state.focused;
export const active = (state) => state.modules.find(function(module) { return module.id === state.active; });

export const modules = (state) => state.modules.filter(function(module) { return module.id !== 0; });
export const connections = (state) => state.connections;
export const parameterKey = (state) => state.parameterKey;
export const parameters = (state) => (state.parameterSets[state.parameterKey] &&
                                      state.parameterSets[state.parameterKey].parameters || {});

export const bounds = (state) => state.modules.slice(1).reduce(function(max, module) { return Math.max(max, module.x); }, 0);
