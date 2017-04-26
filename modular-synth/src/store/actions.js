import Vue from 'vue';
import { api } from './firebase';
import { NAME_KEY, MODULES_KEY, CONNECTIONS_KEY, PARAMETERS_KEY } from './index';


// -----------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------
export const loadPatch = ({ commit, state }, name) => {
  let patch;
  let connections;

  if (name && state.patches[name]) {
    console.log('  Loading patch: ', name);
    patch = state.patches[name];
    connections = state.patches[name].connections;
  } else {
    console.log('  Loading patch from localStorage');
    patch = {
      name: localStorage.getItem(NAME_KEY) || '_default',
      id: parseInt(localStorage.getItem('id')) || 0,
      modules: JSON.parse(localStorage.getItem(MODULES_KEY)) || [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
      parameterSets: JSON.parse(localStorage.getItem(PARAMETERS_KEY)) || []
    };
    connections = JSON.parse(localStorage.getItem(CONNECTIONS_KEY)) || [];
  }


  commit('LOAD_PATCH', patch);

  // ensure nodes (+ inlets/outlets) are in the DOM
  Vue.nextTick(function() {
    console.log('All modules loaded, now routing audio...');
    commit('LOAD_CONNECTIONS', connections);
    // commit('LOAD_PARAMS', patch.parameterSets[0] || []);
  });
};

export const savePatch = ({ state }) => {
  const name = encodeURI(state.name.toLowerCase());
  const patch = {
    id: state.id,
    name: state.name,
    modules: state.modules,
    connections: state.connections,
    parameterSets: {}
  };

  api.save('patch/' + name, patch)
    .then(() => {
      console.log('saved');
    })
    .catch((err) => {
      console.log(err); // NOT SIGNED IN ?
    });
};

export const fetchPatches = ({ commit }) => {
  api.load('/patch')
    .then((response) => {
      const patches = response.val();  // val() is a firebase thing

      commit('LOAD_PATCHES', patches);
    })
    .catch(() => {
      console.log('Not signed in.'); // NOT SIGNED IN ?
    });
};

export const loadParameters = ({ state }, id) => {
  // const params = state.parameterSets.find((p) => { return p.id === id; }).params || [];
  const _params = state.parameterSets[id].params;  // for now: dont filter by id, just use array index to directly access params object (assumes id is equal to array index)

  for (let [mid, params] of Object.entries(_params)) {
    // option 1. Data driven
    // find each module sequentually, then find knobs / children
    const mod = window.synth.$children.find((m) => { return m.id === mid; });
    for (let [param, value] in params) {
      let knob = mod.$children.find(k => { return k.name === param; });

      console.log(mod);
      knob.update(value);
    }

    // option 2
    // find all knobs, then filter by each module
    // knobs = App.$childen.filter(m => m.type == knob);
    // ...
    // knobs.filter((k) => { k is $child of module });
  }
};

// -----------------------------------------------
//  APP
// -----------------------------------------------

export const togglePower = ({ commit }) => {
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
//   commit('ADD_MODULE', { type });
//   //
//   // update gridlist here?
//   //
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
//  CONNECTIONS
// -----------------------------------------------

// export const addConnection = ({ commit }, outlet) => {
//   commit('ADD_CONNECTION', outlet.port);
// };

export const removeConnection = ({ commit }, id) => {
  commit('REMOVE_CONNECTION', id);
};
