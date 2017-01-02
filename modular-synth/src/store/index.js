import Vue from 'vue';
import Vuex from 'vuex';
// import mutations from './mutations';
// import actions from './actions';
// import getters from './getters';

import * as mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

import plugins from './plugins';

Vue.use(Vuex);


export const STORAGE_KEY_MODULES = 'modules';
export const STORAGE_KEY_CONNECTIONS = 'connections';


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  id: parseInt(localStorage.getItem('id')) || 0,    // module id. Start at 1, as masterOut is 0 (we increment just prior to adding new Modules)
  modules: JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[{"type": "MasterOut", "id": 0, "x": 0, "y": 0}]'),
  // connections: JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]'),
  connections: undefined,   // NOTE: this is intentional to force a delayed "loading" of the connectors. We grab them
                            // in localStorage manually in the webAudioPlugin _after_ all the modules have loaded in
                            // order to ensure audio-routing and visual connections will have Objects to link to / from
  editing: false,
  focused: undefined,  // Hovered: Module Info, Connections.
  active: 0             // Clicked: Dragging, Deleting.
};


// -----------------------------------------------
//  STORE
// -----------------------------------------------

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  plugins
  // strict: process.env.NODE_ENV !== 'production'
});
