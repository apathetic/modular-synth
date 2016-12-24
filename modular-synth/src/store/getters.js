// export const getters = {
//   editing: (state) => state.editing,
//   active: (state) => state.modules.find(function(module) { return module.id === state.active; }),
//   modules: (state) => state.modules.find(function(module) { return module.id !== 0; }),
//   connectors: (state) => state.connections,
//   selected: (state) => state.selected
// };

export function editing(state) { return state.editing; }
export function active(state) { return state.modules.find(function(m) { return m.id === state.active; }); }
export function modules(state) { return state.modules.find(function(m) { return m.id !== 0; }); }
export function connectors(state) { return state.connections; }
export function selected(state) { return state.selecte; }
