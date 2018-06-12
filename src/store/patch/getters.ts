
// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

export const parameterSets = (state) => state.parameterSets;

export const modules = (state) => state.modules.filter((module) => module.id !== 0);
export const connections = (state) => state.connections;
export const parameterKey = (state) => state.parameterKey;
export const parameters = (state) => (state.parameterSets[state.parameterKey] &&
    state.parameterSets[state.parameterKey].parameters || {});
