// -----------------------------------------------
//  BOOTSTRAP
// -----------------------------------------------
// export const load = ({ commit }, newState = false) => {
//   commit('LOAD', newState);
// };


// -----------------------------------------------
//  APP
// -----------------------------------------------
export const toggleEditMode = ({ commit }) => {
  commit('TOGGLE_EDIT');
};


// -----------------------------------------------
//  UI
// -----------------------------------------------
export const setActive = ({ commit }, id) => {
  commit('SET_ACTIVE', id);
};

export const clearActive = ({ commit }) => {
  // commit('CLEAR_ACTIVE');
};

// TODO ----------------- move to VUE BUS ? or within App.vue only ...?
export const setFocus = ({ commit }, id) => {
  commit('SET_FOCUS', id);
};

export const clearFocus = ({ commit }) => {
  commit('CLEAR_FOCUS');
};
// ---------------------------------------


// -----------------------------------------------
//  MODULES
// -----------------------------------------------
// export const addModule = ({ commit }, type) => {
//   commit('ADD_MODULE', type);
//   //
//   // update gridlist here?
//   //
// };

// export const registerDimensions = ({ commit }, id, w, h) => {
//   commit('REGISTER_DIMENSIONS', id, w, h);
// };

export const removeModule = ({ commit, state }) => {
  // only delete active/focused modules
  if (state.active === state.focused) {
    const id = state.active;

    commit('REMOVE_MODULE', id);

    state.connections.forEach((connection) => {
      if (connection.to.id === id || connection.from.id === id) {
        commit('REMOVE_CONNECTION', connection.id);
      }
    });
  }
};


// -----------------------------------------------
//  POSITION
// -----------------------------------------------
export const updateGridPosition = ({ commit, state }, id, x, y) => {
  // if in EDIT MODE, we want to update the node AND the store
  // if in PLAY mode, we just want to update the node
  if (state.editing || id === 0) {
    // commit('UPDATE_GRID_POSITION', id, x, y);
    commit('UPDATE_GRID_POSITION', { id, x, y });
  }
};

export const updateRackPosition = ({ commit }, id, col, row) => {
  commit('UPDATE_RACK_POSITION', { id, col, row });
};


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------
export const updateConnection = ({ commit }, id, port) => {
  commit('UPDATE_CONNECTION', id, port);
};

// export const addConnection = ({ commit }, outlet) => {
//   commit('ADD_CONNECTION', outlet.port);
// };

export const removeConnection = ({ commit }, id) => {
  commit('REMOVE_CONNECTION', id);
};
