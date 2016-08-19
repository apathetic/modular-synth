
// -----------------------------------------------
//  BOOTSTRAP
// -----------------------------------------------

export const bindConnections = ({ dispatch, state }) => {
  const connections = state.connections;
  const modules = state.modules;

  for (let connection of connections) {
    console.log(connection);
    const fromId = connection.from.module.id;
    connection.from.module = modules.find(function(m) { return m.id === fromId; });

    const toId = connection.to.module.id;
    connection.to.module = modules.find(function(m) { return m.id === toId; });
  }
};

export const routeAudio = ({ dispatch, state }) => {

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

export const removeModule = ({ dispatch }, id) => {
  dispatch('REMOVE_MODULE', id);
};

export const updatePosition = ({ dispatch }, id, x, y) => {
  dispatch('UPDATE_POSITION', id, x, y);
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
