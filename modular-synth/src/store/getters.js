// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

export const editing = (state) => state.editing;
export const active = (state) => state.modules.find(function(module) { return module.id === state.active; });
export const modules = (state) => state.modules.filter(function(module) { return module.id !== 0; });
export const connections = (state) => state.connections;
export const selected = (state) => state.selected;
