// -----------------------------------------------
//  GETTERS
// -----------------------------------------------

export const getters = {
  editing: (state) => state.editing,
  active: (state) => state.modules.find(function(module) { return module.id === state.active; }),
  modules: (state) => state.modules.filter(function(module) { return module.id !== 0; }),
  connections: (state) => state.connections,
  selected: (state) => state.selected
};
