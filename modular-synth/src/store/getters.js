// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

export const power = (state) => state.power;
export const editing = (state) => state.editing;
// export const active = (state) => state.modules.find(function(module) { return module.id === state.active; });
// export const parameters = (state) => state.parameters;
export const focused = (state) => state.focused;

// export const modules = (state) => state.modules.filter(function(module) { return module.id !== 0; });
// export const connections = (state) => state.connections;

// export const parameterSets = (state) => state.patches[state.patchKey].parameterSets;
// export const parameters = (state) => state.patches[state.patchKey].parameterSets[state.parameterKey].parameters;

export const patches = (state) => state.patches;
export const patch = (state) => state.patches[state.patchKey];

export const modules = (state) => state.patches[state.patchKey].modules.filter(function(module) { return module.id !== 0; });

// export const active = (state) => state.patches[state.patchKey].modules.find(function(module) { return module.id === state.active; });
export const active = (state) => modules.find(function(module) { return module.id === state.active; });

export const connections = (state) => state.patches[state.patchKey].connections;
export const parameters = (state) => state.patches[state.patchKey].parameterSets[state.paramsKey];

// patchKey() { return this.$store.state.patchKey; },
// paramsKey() { return this.$store.state.paramsKey; },
