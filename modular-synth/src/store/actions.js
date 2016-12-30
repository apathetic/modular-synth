export const getters = {

  // -----------------------------------------------
  //  BOOTSTRAP
  // -----------------------------------------------

  load({ commit }, newState = false) {
    commit('LOAD', newState);
  },


  // -----------------------------------------------
  //  APP
  // -----------------------------------------------

  toggleEditMode({ commit }) {
    commit('TOGGLE_EDIT');
  },


  // -----------------------------------------------
  //  UI
  // -----------------------------------------------


  // TODO ----------------- move to VUE BUS ?
  setActive({ commit }, id) {
    commit('SET_ACTIVE', id);
  },

  clearActive({ commit }) {
    // commit('CLEAR_ACTIVE');
  },

  setFocus({ commit }, id) {
    commit('SET_FOCUS', id);
  },

  clearFocus({ commit }) {
    commit('CLEAR_FOCUS');
  },
    // ---------------------------------------


  // -----------------------------------------------
  //  MODULES
  // -----------------------------------------------

  addModule({ commit }, type) {
    commit('ADD_MODULE', type);
    //
    // update gridlist here?
    //
  },

  registerDimensions({ commit }, id, w, h) {
    commit('REGISTER_DIMENSIONS', id, w, h);
  },

  removeModule({ commit, state }) {
    // only delete active/selected modules
    if (state.active === state.selected) {
      const id = state.active;

      commit('REMOVE_MODULE', id);

      state.connections.forEach((connection) => {
        if (connection.to.id === id || connection.from.id === id) {
          commit('REMOVE_CONNECTION', connection.id);
        }
      });
    }
  },


  // -----------------------------------------------
  //  POSITION
  // -----------------------------------------------

  updateGridPosition({ commit, state }, id, x, y) {
    // if in EDIT MODE, we want to update the node AND the store
    // if in PLAY mode, we just want to update the node
    if (state.editing || id === 0) {
      commit('UPDATE_GRID_POSITION', id, x, y);
    }
  },

  updateRackPosition({ commit }, id, col, row) {
    commit('UPDATE_RACK_POSITION', id, col, row);
  },


  // -----------------------------------------------
  //  CONNECTIONS
  // -----------------------------------------------

  updateConnection({ commit }, id, port) {
    commit('UPDATE_CONNECTION', id, port);
  },

  newConnection({ commit }, outlet) {
    commit('ADD_CONNECTION', outlet.port);
  },

  removeConnection({ commit }, id) {
    commit('REMOVE_CONNECTION', id);
  }

};
