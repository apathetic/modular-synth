// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

export const patches = (state) => state.patches;
export const power = (state) => state.power;
export const editing = (state) => state.editing;
export const focused = (state) => state.focused;

export const active = (state) => state.modules.find(function(module) { return module.id === state.active; });
export const parameters = (state) => state.parameters;
export const modules = (state) => state.modules.filter(function(module) { return module.id !== 0; });
export const connections = (state) => state.connections;


// export const patch = (state) => state.patchKey && state.patches[state.patchKey] | {};
// export const modules = (state) => state.patchKey && state.patches[state.patchKey].modules.filter(function(module) { return module.id !== 0; }) || {};
// export const active = (state) => state.patchKey && state.patches[state.patchKey].modules.find(function(module) { return module.id === state.active; });
// export const connections = (state) => state.patches[state.patchKey].connections;
// export const parameterSets = (state) => state.patches[state.patchKey].parameterSets;
// export const parameters = (state) => state.patches[state.patchKey].parameterSets[state.paramsKey];
