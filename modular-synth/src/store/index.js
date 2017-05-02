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
export const PARAMETERS_KEY = 'parameters';


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  key: 'blank',            // key of active patch
  // name: 'Blank',        // NOTE: this is overwritten in actions.js > loadPatch()
  id: 0,                   // for keeping track of modules AND connections
  modules: [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
  connections: [],
  parameters: JSON.parse(localStorage.getItem(PARAMETERS_KEY) || '{}'),

  power: false,
  editing: false,
  focused: undefined,       // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: 0,                // "Clicked": for Dragging, Deleting.

  patches: []               // all available patches, cached here
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
