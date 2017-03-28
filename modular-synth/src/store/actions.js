import { api } from './firebase';


// -----------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------
export const loadPatch = ({ commit, state }, name) => {
  // api.load('/patch/' + name).then((response) => {
  //   const patch = response.val();  // val() is a firebase thing
  //
  //   commit('LOAD_PATCH', patch);
  // });

  if (state.patches[name]) {
    console.log('===================');
    console.log('Loading patch: ', name);
    commit('LOAD_PATCH', state.patches[name]);
    commit('LOAD_CONNECTIONS', state.patches[name].connections);

    // if (params) ...
      // commit('LOAD_PARAMS', state.patches[name].parameterSets[0]);
    // }
  }
};

export const savePatch = ({ state }) => {
  const name = encodeURI(state.name.toLowerCase());
  const patch = {
    id: state.id,
    name: state.name,
    modules: state.modules,
    connections: state.connections
  };

  api.save('patch/' + name, patch)
    .then(() => {
      console.log('saved');
    })
    .catch((err) => {
      console.log(err); // NOT SIGNED IN ?
    });
};

export const loadPatches = ({ commit }) => {
  api.load('/patch')
    .then((response) => {
      const patches = response.val();  // val() is a firebase thing

      commit('LOAD_PATCHES', patches);
    })
    .catch((err) => {
      console.log(err); // NOT SIGNED IN ?
    });
};

export const loadParameters = () => {
};

// -----------------------------------------------
//  APP
// -----------------------------------------------

export const togglePower = ({ commit }) => {
  // this.power = !this.power;
  // if (this.power) {
  //   console.log('audio on');
  //   this.$bus.$emit('audio:start');
  // } else {
  //   console.log('audio off');
  //   this.$bus.$emit('audio:stop');
  // }

  commit('TOGGLE_POWER');
};

export const toggleEditMode = ({ commit }) => {
  commit('TOGGLE_EDIT');
};


// -----------------------------------------------
//  UI
// -----------------------------------------------
export const setActive = ({ commit }, id) => {
  commit('SET_ACTIVE', id);
};

export const clearActive = ({ commit }) => {
  // commit('CLEAR_ACTIVE');
};

// TODO ----------------- move to VUE BUS ? or within App.vue only ...?
export const setFocus = ({ commit }, id) => {
  commit('SET_FOCUS', id);
};

export const clearFocus = ({ commit }) => {
  commit('CLEAR_FOCUS');
};
// ---------------------------------------


// -----------------------------------------------
//  MODULES
// -----------------------------------------------
// export const addModule = ({ commit }, type) => {
//   commit('ADD_MODULE', type);
//   //
//   // update gridlist here?
//   //
// };

// export const registerDimensions = ({ commit }, id, w, h) => {
//   commit('REGISTER_DIMENSIONS', id, w, h);
// };

export const removeModule = ({ commit, state }) => {
  // only delete active/focused modules
  if (state.active === state.focused) {
    const id = state.active;

    commit('REMOVE_MODULE', id);

    state.connections.forEach((connection) => {
      if (connection.to.id === id || connection.from.id === id) {
        commit('REMOVE_CONNECTION', connection.id);
      }
    });
  }
};


// -----------------------------------------------
//  POSITION
// -----------------------------------------------
// export const updateGridPosition = ({ commit, state }, id, x, y) => {
//   // if in EDIT MODE, we want to update the node AND the store
//   // if in PLAY mode, we just want to update the node
//   if (state.editing || id === 0) {
//     commit('UPDATE_GRID_POSITION', { id, x, y });
//   }
// };

// export const updateRackPosition = ({ commit }, id, col, row) => {
//   commit('UPDATE_RACK_POSITION', {
//     id: id,
//     col: col,
//     row: row
//   });
// };


// -----------------------------------------------
//  CONNECTIONS
// -----------------------------------------------

// export const addConnection = ({ commit }, outlet) => {
//   commit('ADD_CONNECTION', outlet.port);
// };

export const removeConnection = ({ commit }, id) => {
  commit('REMOVE_CONNECTION', id);
};
