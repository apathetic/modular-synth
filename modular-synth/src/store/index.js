import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';
import * as mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

Vue.use(Vuex);

export const _KEY = 'patchKey';
export const _PARAMETER_KEY = 'parameterKey';
export const _NAME = 'name';
export const _MODULES = 'modules';
export const _CONNECTIONS = 'connections';
export const _PARAMETERS = 'parameters';


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {

  // APP: USER STATE
  power: false,
  editing: false,
  focused: undefined,                                // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: 0,                                         // "Clicked": for Dragging, Deleting.
  // contextmenu: false,

  // PATCH: WORKING DATA
  id: 0,                                             // for keeping track of modules AND connections
  name: localStorage.getItem(_NAME) || 'Hello World', // CAN PROB KILL THIS...
  modules: [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
  connections: [],
  parameters: JSON.parse(localStorage.getItem(_PARAMETERS) || '{}'),

  // APP: "PERSISTENT" STORAGE
  patches: [],                                       // all available patches, cached here
  patchKey: localStorage.getItem(_KEY) || 'default', // key of active patch
  parameterKey: 0                                    // key of active parameter set
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
