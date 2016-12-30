// -----------------------------------------------
//  MUTATIONS
// -----------------------------------------------

export const mutations = {
  LOAD(state, newState) {
    if (newState) {
      for (let key in newState) {
        state[key] = newState[key];
      }
    }
  },

  TOGGLE_EDIT(state) {
    state.editing = !state.editing;
  },

  SET_ACTIVE(state, id) {
    state.active = id;
  },
  CLEAR_ACTIVE(state) {
    state.active = undefined;
  },
  SET_FOCUS(state, id) {
    state.selected = id;
  },
  CLEAR_FOCUS(state) {
    state.selected = undefined;
  },

  ADD_MODULE(state, type) {
    state.id++;
    state.modules.push({
      id: state.id,
      type: type,
      x: 0,         // for dragging X
      y: 0,         // for dragging Y
      col: 0,       // for grid X position
      row: 0,       // for grid Y position
      h: 0,         // for rack height
      w: 0          // for rack width
    });
  },
  REMOVE_MODULE(state, id) {
    state.modules = state.modules.filter((m) => {
      return m.id !== id;
    });
  },

  UPDATE_GRID_POSITION(state, id, x, y) {
    const module = state.modules.find(function(module) { return module.id === id; });

    module.x = x;
    module.y = y;
  },
  UPDATE_RACK_POSITION(state, id, col, row) {
    const module = state.modules.find(function(module) { return module.id === id; });

    module.col = col;
    module.row = row;
  },
  REGISTER_DIMENSIONS(state, id, w, h) {
    const module = state.modules.find(function(module) { return module.id === id; });
    // const module = state.modules.find((module) => { module.id === id; });

    module.w = w;
    module.h = h;
  },

  ADD_CONNECTION(state, port) {
    // find the module that contains the outlet. Ironically, we dont even use "outlet" to
    // determine this, instead relying on the "selected" module in the App.
    state.id++;

    const from = {
      id: state.selected,
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

    // state.id++;
  },
  UPDATE_CONNECTION(state, id, port) {
    const connection = state.connections.find(function(c) { return c.id === id; });
    const to = {
      id: state.selected,
      port: port
    };

    connection.to = to;
  },
  REMOVE_CONNECTION(state, id) {
    state.connections = state.connections.filter((c) => {
      return c.id !== id;
    });
  }
};
