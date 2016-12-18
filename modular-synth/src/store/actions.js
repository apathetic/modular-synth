
// -----------------------------------------------
//  BOOTSTRAP
// -----------------------------------------------

export const load = ({ dispatch }, newState = false) => {
  dispatch('LOAD', newState);
};


// -----------------------------------------------
//  APP
// -----------------------------------------------

export const toggleEditMode = ({ dispatch, state }) => {
  dispatch('TOGGLE_EDIT');
};


// -----------------------------------------------
//  UI
// -----------------------------------------------

export const setActive = ({ dispatch, state }, id) => {
  dispatch('SET_ACTIVE', id);
};

export const clearActive = ({ dispatch, state }) => {
  // dispatch('CLEAR_ACTIVE');
};

export const setFocus = ({ dispatch, state }, id) => {
  dispatch('SET_FOCUS', id);
};

export const clearFocus = ({ dispatch, state }) => {
  dispatch('CLEAR_FOCUS');
};


// -----------------------------------------------
//  MODULES
// -----------------------------------------------

export const addModule = ({ dispatch }, type) => {
  dispatch('ADD_MODULE', type);
  //
  // update gridlist here?
  //
};

export const registerDimensions = ({ dispatch }, id, w, h) => {
  dispatch('REGISTER_DIMENSIONS', id, w, h);
};

export const removeModule = ({ dispatch, state }) => {
  // only delete active/selected modules
  if (state.active === state.selected) {
    const id = state.active;

    dispatch('REMOVE_MODULE', id);

    state.connections.forEach((connection) => {
      if (connection.to.id === id || connection.from.id === id) {
        dispatch('REMOVE_CONNECTION', connection.id);
      }
    });
  }
};


// -----------------------------------------------
//  POSITION
// -----------------------------------------------

export const updateGridPosition = ({ dispatch, state }, id, x, y) => {
  // if in EDIT MODE, we want to update the node AND the store
  // if in PLAY mode, we just want to update the node
  if (state.editing || id === 0) {
    dispatch('UPDATE_GRID_POSITION', id, x, y);
  }
};

export const updateRackPosition = ({ dispatch }, id, col, row) => {
  dispatch('UPDATE_RACK_POSITION', id, col, row);
};


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------

export const updateConnection = ({ dispatch, state }, id, port) => {
  dispatch('UPDATE_CONNECTION', id, port);
};

export const newConnection = ({ dispatch }, outlet) => {
  dispatch('ADD_CONNECTION', outlet.port);
};

export const removeConnection = ({ dispatch }, id) => {
  dispatch('REMOVE_CONNECTION', id);
};
