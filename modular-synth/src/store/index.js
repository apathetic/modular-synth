import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';
import * as mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);


export const LS_NAME = 'name';
export const LS_MODULES = 'modules';
export const LS_CONNECTIONS = 'connections';


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  name: localStorage.getItem(LS_NAME) || '',
  id: parseInt(localStorage.getItem('id')) || 0,    // NOTE: this will actually start at 1 (we increment just prior to adding new), as masterOut is 0
  modules: JSON.parse(localStorage.getItem(LS_MODULES) || '[{"type": "MasterOut", "id": 0, "x": 0, "y": 0}]'),
  connections: [],          // NOTE: this is intentional to force a delayed "loading" of the connectors. We grab them
                            // in localStorage manually in the webAudioPlugin _after_ all the modules have loaded in
                            // order to ensure audio-routing and visual connections will have Objects to link to / from
                            // nope => connections: JSON.parse(localStorage.getItem(LS_CONNECTIONS) || '[]'),
  editing: false,
  focused: undefined,       // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: 0                 // "Clicked": for Dragging, Deleting.
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
