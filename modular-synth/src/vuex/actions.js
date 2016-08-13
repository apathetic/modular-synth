// -----------------------------------------------
//  Modules
// -----------------------------------------------

export const setActiveModule = ({ dispatch, state }, id) => {
  if (state.activeModule !== id) {
    dispatch('SET_ACTIVE', id);
  }
};

export const newModule = ({ dispatch }, type) => {
  dispatch('ADD_MODULE', type);
};

export const removeModule = ({ dispatch }, id) => {
  dispatch('REMOVE_MODULE', id);
};

/* NOTE: id *may* be optional here, as we know the active module at all times */
export const updatePosition = ({ dispatch }, id, x, y) => {
  dispatch('UPDATE_POSITION', id, x, y);
};


// -----------------------------------------------
//  Connections
// -----------------------------------------------

export const setActiveConnection = ({ dispatch, state }, id) => {
  if (state.activeConnection !== id) {
    dispatch('SET_ACTIVE_CONNECTION', id);
  }
};

export const updateConnection = ({ dispatch }, id, to) => {
  dispatch('UPDATE_CONNECTION', id, to);
};


export const updateConnection_ = ({ dispatch }, inlet) => {
  // use   state.activeConnection
  console.log(inlet);
};


export const newConnection = ({ dispatch }, outlet) => {
  dispatch('ADD_CONNECTION', outlet);
};

export const removeConnection = ({ dispatch }) => {
  dispatch('REMOVE_CONNECTION');
};
