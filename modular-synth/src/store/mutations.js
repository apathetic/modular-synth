// -----------------------------------------------
//  BOOTSTRAP
// -----------------------------------------------
export const LOAD = (state, newState) => {
  if (newState) {
    // delete state.id;
    // delete state.connections;
    // delete state.modules;
    // delete state.name;
    for (let key in newState) {
      state[key] = newState[key];
    }
  }
};


// -----------------------------------------------
//  APP
// -----------------------------------------------
export const TOGGLE_EDIT = (state) => {
  state.editing = !state.editing;
};

export const REGISTER_DIMENSIONS = (state, data) => {
  const module = state.modules.find((m) => { return m.id === data.id; });

  module.w = data.w;
  module.h = data.h;
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
export const ADD_MODULE = (state, type) => {
  state.id++;
  state.modules.push({
    id: state.id,
    type: type,
    x: 0,         // for dragging X
    y: 0,         // for dragging Y
    col: 0,       // for rack X position
    row: 0,       // for rack Y position
    h: 0,         // for rack height
    w: 0          // for rack width
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


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------
export const ADD_CONNECTION = (state, port) => {
  // find the module that contains the outlet. Ironically, we dont even use "outlet" to
  // determine this, instead relying on the currently "focused" module in the App.
  state.id++;

  const from = {
    id: state.focused,
    port: port
  };

  const to = {
    id: undefined,
    port: undefined
  };

  state.connections.push({
    id: parseInt(state.id),
    to,
    from
  });
};

export const UPDATE_CONNECTION = (state, data) => {
  const connection = state.connections.find((c) => { return c.id === data.id; });

  connection.to = {
    id: state.focused,
    port: data.port
  };
};

export const REMOVE_CONNECTION = (state, id) => {
  state.connections = state.connections.filter((c) => {
    return c.id !== id;
  });
};
