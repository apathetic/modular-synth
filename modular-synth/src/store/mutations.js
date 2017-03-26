import { moduleSize } from '../dimensions';

// -----------------------------------------------
//  BOOTSTRAP
// -----------------------------------------------
export const LOAD_PATCH = (state, patch) => {
  if (patch) {
    // Does the delete kill Vue's reactivity stuffs ...? Answer: YES
    // delete state.id;
    // delete state.connections;
    // delete state.modules;
    // delete state.name;

    // perhaps:
    // Vue.delete(state, 'id');

    // for (let key in patch) {
    //   state[key] = patch[key];
    // }

    state.id = patch.id;
    state.name = patch.name;
    state.modules = patch.modules;
  }
};

export const LOAD_PATCHES = (state, patches) => {
  state.patches = patches;    // check if patches is an array, or ...?
};

export const LOAD_PARAMS = () => {
  //
};

// -----------------------------------------------
//  APP
// -----------------------------------------------
export const TOGGLE_EDIT = (state) => {
  state.editing = !state.editing;
};

// export const REGISTER_DIMENSIONS = (state, data) => {
//   const module = state.modules.find((m) => { return m.id === data.id; });
//
//   module.w = data.w;
//   module.h = data.h;
// };


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
export const ADD_MODULE = (state, type) => {
  const size = moduleSize[type] || [1, 1];

  state.id++;
  state.modules.push({
    id: state.id,
    type: type,
    x: 0,         // for dragging X position
    y: 0,         // for dragging Y position
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
export const ADD_CONNECTION = (state, data) => {
  // find the module that contains the outlet. Ironically, we dont even use "outlet" to
  // determine this, instead relying on the currently "focused" module in the App.
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
