import { moduleSize } from '../../dimensions';
import { validateData } from '../../schema';

// -----------------------------------------------
//  PATCH
// -----------------------------------------------
// loads modules, id, and patch name
// connection, parameters are loaded below
export const LOAD_PATCH = (state, patch) => {
  if (patch) {
    state.id = patch.id;
    state.name = patch.name;
    state.modules = patch.modules;
    state.parameterSets = patch.parameterSets;
    // NOTE: parameters (knobs, sliders, etc) are created only after
    // their parent is; they then register themselves within the store.
    // Parameter values are then only fetched once the params:load event
    // is fired
  }
};

export const SAVE_PATCH = (state, data) => {
  const patch = data.patch;
  const key = data.key;

  state.patches[key] = patch;
};

export const REMOVE_PATCH = (state, key) => {
  delete state.patches[key];
  // Vue.delete(state.patches, key);
  // state.patches.$remove(key);
  // state.patches = state.patches.filter(....
};

export const SET_PATCHES = (state, patches) => {
  state.patches = validateData(patches); // patches;
};

export const SET_NAME = (state, name) => {
  state.name = name;
};

export const SET_KEY = (state, key) => {
  state.patchKey = key;
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
  const module = state.modules.find(function(module) { return module.id === data.id; });

  module.x = data.x;
  module.y = data.y;
};

export const UPDATE_RACK_POSITION = (state, data) => {
  const module = state.modules.find(function(module) { return module.id === data.id; });

  module.col = data.col;
  module.row = data.row;
};

export const UPDATE_SCROLL_OFFSET = (state, data) => {
  state.canvasOffset = data;
};


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------
export const LOAD_CONNECTIONS = (state, data) => {
  state.connections = data;
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
export const ADD_PARAMETERS = (state) => {
  const key = state.parameterKey;
  const set = state.parameterSets[key];
  const copy = {
    name: '<empty>',
    params: set && set.parameters || {}
  };

  state.parameterSets.push(copy);
};

export const REMOVE_PARAMETERS = (state, key) => {
  // state.patches[state.patchKey].parameterSets.splice(id, 1); // let's try mutating the array directly
  state.parameterSets.splice(key, 1); // let's try mutating the array directly
};

export const SET_PARAMETERS_NAME = (state, name) => {
  const key = state.parameterKey;

  state.parameterSets[key].name = name;
};

export const SET_PARAMETERS_KEY = (state, key) => {
  state.parameterKey = key;
};

export const REGISTER_PARAMETER = (state, id) => {
  const key = state.parameterKey;
  const set = state.parameterSets[key];

  if (set && !set.parameters[id]) {
    set.parameters[id] = 0;
    console.log(id, ' registered');
  } else {
    console.log(id, ' was already present');
  }
};

export const REMOVE_PARAMETER = (state, id) => {
  state.parameterSets.forEach(set => {
    if (set.parameters[id]) {
      delete set.parameters[id];
    }
  });
};

export const SET_PARAMETER = (state, data) => {
  const key = state.parameterKey;
  const set = state.parameterSets[key];

  if (set.parameters) {
    set.parameters[data.id] = data.value;
  }
};
