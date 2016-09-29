
// -----------------------------------------------
//  BOOTSTRAP
// -----------------------------------------------

export const load = ({ dispatch }, newState) => {
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

export const setSelected = ({ dispatch, state }, id) => {
  if (state.selected !== id) {
    dispatch('SET_SELECTED', id);
  }
};

export const resetSelected = ({ dispatch, state }) => {
  dispatch('RESET_SELECTED');
};


// -----------------------------------------------
//  MODULES
// -----------------------------------------------

export const setActiveModule = ({ dispatch, state }, id) => {
  if (state.activeModule !== id) {
    dispatch('SET_ACTIVE_MODULE', id);
  }
};

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
    dispatch('UPDATE_POSITION', id, x, y);
  }
};

export const updateGridLocation = ({ dispatch }, id, col, row) => {
  dispatch('UPDATE_LOCATION', id, col, row);
};


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------

export const setActiveConnection = ({ dispatch, state }, id) => {
  if (state.activeConnection !== id) {
    dispatch('SET_ACTIVE_CONNECTION', id);
  }
};

export const updateConnection = ({ dispatch, state }, id, to) => {
  // if (xxx.from.connection === xxx.to.connection) {
  //   dispatch('REMOVE_CONNECTION', id, to);
  // } else {
  dispatch('SET_ACTIVE_CONNECTION', id);  // because sometimes this doesn't happen with :hover
  dispatch('UPDATE_CONNECTION', to);
};

export const newConnection = ({ dispatch }, outlet) => {
  dispatch('ADD_CONNECTION', outlet);
};

export const removeConnection = ({ dispatch }) => {
  dispatch('REMOVE_CONNECTION');
};
