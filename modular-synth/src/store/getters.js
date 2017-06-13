// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

export const power = (state) => state.power;
export const editing = (state) => state.editing;
export const active = (state) => state.modules.find(function(module) { return module.id === state.active; });
export const modules = (state) => state.modules.filter(function(module) { return module.id !== 0; });
export const connections = (state) => state.connections;
export const parameters = (state) => state.parameters;
export const focused = (state) => state.focused;

// export const modules = (state) => state.patches[state.name].modules;
// export const connections = (state) => state.patches[state.name].connections;

// export const parameterSets = (state) => state.patches[state.patchKey].parameterSets;
// export const parameters = (state) => state.patches[state.patchKey].parameterSets[state.parameterKey].parameters;
