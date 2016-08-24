import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';

Vue.use(Vuex);


export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';

/**
 * [routeAudio description]
 * @param  {[type]} source      [description]
 * @param  {[type]} destination [description]
 * @return {[type]}             [description]
 */
function routeAudio(source, destination) {
  const audioOut = source.data;
  const audioIn = destination.data;

  if (audioOut && audioIn) {
    console.log('connecting %s --> %s', source.label, destination.label);
    audioOut.connect(audioIn);
  }
}


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  id: localStorage.getItem('id') || 1,    // module id. Start at 1, as masterOut is 0.
  cid: localStorage.getItem('cid') || 0,  // connector id
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[{"type": "MasterOut", "id": 0, "x": 0, "y": 0}]'),
  connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]'),
  selected: null,
  activeModule: 0,
  activeConnection: 0
};


// -----------------------------------------------
//  MUTATIONS
// -----------------------------------------------

const mutations = {
  LOAD(state, newState) {
    console.log(newState, 'asfdsfdafd');
    for (let key in newState) {
      state[key] = newState[key];
    }
  },

  SET_SELECTED(state, id) {
    state.selected = id;
  },
  RESET_SELECTED(state) {
    state.selected = null;
  },

  SET_ACTIVE_MODULE(state, id) {
    state.activeModule = id;
  },
  ADD_MODULE(state, type) {
    state.modules.push({
      id: state.id,
      type: type,
      x: 0,
      y: 0
    });
    state.id++;
  },
  REMOVE_MODULE(state) {
    // const id = state.selected;
    const id = state.activeModule;
    state.modules = state.modules.filter((module) => {
      module.id !== id;
    });

    // state.modules.splice(state.modules.indexOf(id), 1);

    state.connections.forEach((connection) => {
      if (connection.to.module.id === id || connection.from.module.id === id) {
        //
      }
    });
  },
  UPDATE_POSITION(state, id, x, y) {
    // const module = state.modules.find(function(module) { return module.id === state.activeModule; });
    const module = state.modules.find(function(module) { return module.id === id; });
    module.x = x;
    module.y = y;
  },

  SET_ACTIVE_CONNECTION(state, id) {
    state.activeConnection = id;
  },
  ADD_CONNECTION(state, outlet) {
    // const module = state.modules.find((m) => { m.id === state.activeModule; });
    const module = state.modules.find(function(m) { return m.id === state.activeModule; });
    const from = {
      module: module,        // for line (x,y) positioning
      // x: module.x,
      // y: module.y,
      port: outlet.port,     // to calculate where the line will connect
      label: outlet.label,   // for reference
      data: outlet.data      // for data flow
    };


    // ACTUAL:
    // "from":{
    //   "port":0,"label":"output-1","data":{},
    //   "module":{
    //     "id":1,"type":"Node","x":100,"y":237
    //   }

    // BETTER:
    // "from":{
    //   "moduleId":1,
    //   "label":"output-1",
    //   "port":0,
    //   "x":100,
    //   "y":237
    // }



    const to = {
      module: null,
      port: null,
      label: null,
      data: null
    };

    state.connections.push({
      id: parseInt(state.cid),
      to,
      from
    });
    state.cid++;
  },
  UPDATE_CONNECTION(state, to) {
    // const connection = state.connections.find((c) => { c.id === id; });  // WHY NOT WORK
    const connection = state.connections.find(function(c) { return c.id === state.activeConnection; });

    connection.to = to;
    connection.to.module = state.modules.find(function(m) { return m.id === state.activeModule; });
    //                     state.modules.find((m) => { m.id === state.activeModule; });

    // if (connection.to.module === connection.from.module) {
    //     // dispatch('REMOVE_CONNECTION');
    // }

    // const source = connection.from.data;
    // const destination = connection.to.data;
    routeAudio(connection.from, connection.to);
    // if (source && destination) {
    //   source.connect(destination);
    // }
  },
  REMOVE_CONNECTION(state) {
    let active = state.activeConnection;
    let connection = state.connections.find(c => { c.id === active; });
    state.connections.splice(state.modules.indexOf(connection), 1);
  },


  ROUTE_AUDIO(state, source, destination) {
    //
  }
};


// -----------------------------------------------
//  STORE
// -----------------------------------------------

export default new Vuex.Store({
  state,
  mutations,
  plugins
  // strict: process.env.NODE_ENV !== 'production'
});
