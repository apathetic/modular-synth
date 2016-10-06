
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

export const newModule = ({ dispatch }, type) => {
  dispatch('ADD_MODULE', type);
};

export const removeModule = ({ dispatch }) => {
  dispatch('REMOVE_MODULE');
};

export const updatePosition = ({ dispatch, state }, id, x, y) => {
  // if in EDIT MODE, we want to update the node AND the store
  // if in PLAY mode, we just want to update the node
  if (state.editing) {
    dispatch('UPDATE_GRID_POSITION', id, x, y);
  }
};

export const updateGridLocation = ({ dispatch }, id, col, row) => {
  dispatch('UPDATE_RACK_POSITION', id, col, row);
};


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------

export const setActiveConnection = ({ dispatch, state }, id) => {
  if (state.activeConnection !== id) {
    dispatch('SET_ACTIVE_CONNECTION', id);
  }
};

export const updateConnection = ({ dispatch, state }, id, inlet) => {
  console.log(id, inlet);
  // if (xxx.from.connection === xxx.to.connection) {
  //   dispatch('REMOVE_CONNECTION', id, to);
  // } else {
  // dispatch('SET_ACTIVE_CONNECTION', connection.id);  // because sometimes this doesn't happen with :hover
  dispatch('UPDATE_CONNECTION', id, inlet);
};

export const newConnection = ({ dispatch }, outlet) => {
  dispatch('ADD_CONNECTION', outlet);
};

export const removeConnection = ({ dispatch }, id) => {
  dispatch('REMOVE_CONNECTION');
};
