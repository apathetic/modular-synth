
export const incrementAsync = ({ dispatch }) => {
  setTimeout(() => {
    dispatch('INCREMENT');
  }, 1000);
};

// //////////////////////////////////

export const setActive = ({ dispatch }, id) => {
  dispatch('SET_ACTIVE', id);
};

export const newModule = ({ dispatch }, type) => {
  dispatch('ADD_MODULE', type);
};

export const removeModule = ({ dispatch }, id) => {
  dispatch('REMOVE_MODULE', id);
};

export const updateConnection = ({ dispatch }, id, to) => {
  dispatch('UPDATE_CONNECTION', id, to);
};

export const newConnection = ({ dispatch, state }, outlet) => {
  const active = state.active;
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

export const removeConnection = ({ dispatch }, id) => {
  console.log('removing connecteor', id);
  dispatch('REMOVE_CONNECTION', id);
};


/* NOTE: id *may* be optional here, as we know the active module at all times */
export const updatePosition = ({ dispatch }, id, x, y) => {
  dispatch('UPDATE_POSITION', id, x, y);
};
