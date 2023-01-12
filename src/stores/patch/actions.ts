// import type { PatchState } from '@/types';


// -----------------------------------------------
//  MODULES
// -----------------------------------------------

export const addModule = ({ commit }, data) => {
  debugger;
  commit('ADD_MODULE', data);
};


export const removeModule = ({ commit, state, getters, rootState }) => {
  // only delete active/focused modules
  // if (state.active === state.focused) {
  if (rootState.app.active === rootState.app.focused) {
    const id = rootState.app.active;

    commit('REMOVE_MODULE', id);

    state.connections.forEach((connection) => {
      if (connection.to.id === id || connection.from.id === id) {
        commit('REMOVE_CONNECTION', connection.id);
      }
    });

    // Note: KNOB / SLIDERS will remove themselves, yay!
  }
};


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------

// export const addConnection = ({ commit }, outlet) => {
//   commit('ADD_CONNECTION', outlet.port);
// };

// export const removeConnection = ({ commit }, id) => {
//   commit('REMOVE_CONNECTION', id);
// };
