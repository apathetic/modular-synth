import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';
import * as mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

export const NAME_KEY = 'name';
export const MODULES_KEY = 'modules';
export const CONNECTIONS_KEY = 'connections';


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  // name: localStorage.getItem(NAME_KEY) || '',
  // id: parseInt(localStorage.getItem('id')) || 0,    // NOTE: this will actually start at 1 (we increment just prior to adding new), as masterOut is 0
  // modules: JSON.parse(localStorage.getItem(MODULES_KEY) || '[{"type": "MasterOut", "id": 0, "x": 0, "y": 0}]'),
  // connections: undefined,   // NOTE: this is intentional to force a delayed "loading" of the connectors. We grab them
                            // in localStorage manually in the webAudioPlugin _after_ all the modules have loaded in
                            // order to ensure audio-routing and visual connections will have Objects to link to / from.
                            // ie. dont do this... connections: JSON.parse(localStorage.getItem(CONNECTIONS_KEY) || '[]'),

  name: '_default',         // NOTE: this is overwritten in the loadPatch, in actions.js
  id: 0,
  modules: [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
  connections: undefined,

  power: false,
  editing: false,
  focused: undefined,       // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: 0,                // "Clicked": for Dragging, Deleting.
  patches: {},
  parameterSets: []
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
