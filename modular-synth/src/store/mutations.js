import { moduleSize } from '../dimensions';

// -----------------------------------------------
//  BOOTSTRAP
// -----------------------------------------------
export const LOAD_PATCH = (state, patch) => {
  // Modules / Connections / Parameters in the patch are copied
  // to the root of the store. Will need to update so that App
  // can just reference the current patch  within patches ...?
  if (patch) {
    // state.name = patch.name || '_default';
    state.id = patch.id || 0;
    state.modules = patch.modules;
  }
};

export const SET_PATCHES = (state, patches) => {
  state.patches = patches;    // check if patches is an array, or ...?
};


// -----------------------------------------------
//  APP
// -----------------------------------------------
export const TOGGLE_POWER = (state) => {
  state.power = !state.power;
};

export const TOGGLE_EDIT = (state) => {
  state.editing = !state.editing;
};


// -----------------------------------------------
//  UI
// -----------------------------------------------
// TODO ----------------- move to VUE BUS ?
export const SET_ACTIVE = (state, id) => {
  state.active = id;
};

export const CLEAR_ACTIVE = (state) => {
  state.active = undefined;
};

export const SET_FOCUS = (state, id) => {
  state.focused = id;
};

export const CLEAR_FOCUS = (state) => {
  state.focused = undefined;
};


// -----------------------------------------------
//  MODULES
// -----------------------------------------------
export const ADD_MODULE = (state, data) => {
  const type = data.type;
  const pos = data.coords || [0, 0];
  const size = moduleSize[type] || [1, 1];

  state.id++;
  state.modules.push({
    id: state.id,
    type: type,
    x: pos[0],    // for dragging X position
    y: pos[1],    // for dragging Y position
    col: 0,       // for rack X position
    row: 0,       // for rack Y position
    w: size[0],   // for rack width
    h: size[1]    // for rack height
  });
};

export const REMOVE_MODULE = (state, id) => {
  state.modules = state.modules.filter((m) => {
    return m.id !== id;
  });
};


// -----------------------------------------------
//  POSITION
// -----------------------------------------------
export const UPDATE_GRID_POSITION = (state, data) => {
  // TODO this is getting called on delete module, and duplicating /
  // confusing coords of unrelated moduels
  const module = state.modules.find(function(module) { return module.id === data.id; });

  module.x = data.x;
  module.y = data.y;
};

export const UPDATE_RACK_POSITION = (state, data) => {
  const module = state.modules.find(function(module) { return module.id === data.id; });

  module.col = data.col;
  module.row = data.row;
};


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------
export const LOAD_CONNECTIONS = (state, connections) => {
  state.connections = connections;
};

export const ADD_CONNECTION = (state, data) => {
  state.id++;
  state.connections.push({
    id: parseInt(state.id),
    to: data.to,
    from: data.from
  });
};

export const REMOVE_CONNECTION = (state, id) => {
  state.connections = state.connections.filter((c) => {
    return c.id !== id;
  });
};


// -----------------------------------------------
//  PARAMETERS
// -----------------------------------------------
// export const ADD_PARAMETERS = (state, name) => {
//   state.parameterSets.push({
//     name: name,
//     id: ++state.pid,
//     params: {}
//   });
// };
export const LOAD_PARAMETERS = (state, id = 0) => {
  try {
    // const patch = state.patches.find((patch) => { return patch.key === state.key; });
    const patch = state.patches[state.key];
    const parameterSet = patch.parameterSets && patch.parameterSets[id];

    state.parameters = parameterSet.parameters || {};
  } catch (e) {}
};

export const ADD_PARAMETER = (state, id) => {
  state.parameters[id] = null;
};

export const SET_PARAMETER = (state, data) => {
  state.parameters[data.id] = data.value;
};

export const REMOVE_PARAMETER = (state, id) => {
  delete state.parameters[id];
  // Vue.delete(state.parameters, id);
};
