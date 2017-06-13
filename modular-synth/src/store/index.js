import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';
import * as mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

export const KEY = 'patchKey';
export const PARAMETER_KEY = 'parameterKey';
export const NAME_KEY = 'name';
export const MODULES_KEY = 'modules';
export const CONNECTIONS_KEY = 'connections';
export const PARAMETERS_KEY = 'parameters';


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {
  patchKey: localStorage.getItem(KEY) || 'default',  // key of active patch
  parameterKey: 0,                                   // key of active parameter set
  id: 0,                                             // for keeping track of modules AND connections
  name: localStorage.getItem(NAME_KEY) || 'Hello World',
  modules: [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
  connections: [],
  parameters: JSON.parse(localStorage.getItem(PARAMETERS_KEY) || '{}'),

  power: false,
  editing: false,
  focused: undefined,                                // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: 0,                                         // "Clicked": for Dragging, Deleting.

  patches: []                                        // all available patches, cached here
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
