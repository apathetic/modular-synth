
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
    // port: port, // event.target
    port: outlet.port,
    label: outlet.label,   // for reference
    data: outlet.data     // for data flow
    // connections: outlet.connections   // TODO remove this ...shouldn't be necessary
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



export const updatePosition = ({ dispatch }, id, x, y) => {
  dispatch('UPDATE_POSITION', id, x, y);

  // dispatch('UPDATE_CONNECTIONS', module);
};
