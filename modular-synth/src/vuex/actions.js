//------------------------------------------------
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


//------------------------------------------------
//  Connections
// -----------------------------------------------

export const setActiveConnection = ({ dispatch, state }, id) => {
  if (state.activeConnection !== id) {
    dispatch('SET_ACTIVE_CONNECTION', id);
  }
};

export const updateConnection = ({ dispatch }, id, to) => {
  debugger;

  dispatch('UPDATE_CONNECTION', id, to);
};


export const updateConnection_ = ({ dispatch }, inlet) => {
  // use   state.activeConnection
  console.log(inlet);
};


export const newConnection = ({ dispatch, state }, outlet) => {
  const active = state.activeModule;
  const module = state.modules[active];
  // console.log(module.id);   // ._uid?
  // let id = module.id;

  const from = {
    module: module,        // for line (x,y) positioning
    // x: module.x,
    // y: module.y,
    port: outlet.port,     // to calculate where the line will connect
    label: outlet.label,   // for reference
    data: outlet.data      // for data flow
  };

  const to = {    // Object.seal({
    module: null,
    port: null,
    label: null,
    data: null
  };

  dispatch('ADD_CONNECTION', to, from);
  /**/
};

export const removeConnection = ({ dispatch }) => {
  dispatch('REMOVE_CONNECTION');
};


/* NOTE: id *may* be optional here, as we know the active module at all times */
export const updatePosition = ({ dispatch }, id, x, y) => {
  dispatch('UPDATE_POSITION', id, x, y);
};
