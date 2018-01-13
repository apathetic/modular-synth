import Vue from 'vue';
import Vuex from 'vuex';
import plugins from './plugins';
import * as mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';
import { Store } from 'vuex/types'

Vue.use(Vuex);

export const _KEY = 'patchKey';
export const _PARAMETER_KEY = 'parameterKey';
export const _NAME = 'name';
export const _MODULES = 'modules';
export const _CONNECTIONS = 'connections';
export const _PARAMETERS = 'parameterSets';


// -----------------------------------------------
//  STATE
// -----------------------------------------------

const state = {

  // APP: USER STATE
  power: false,
  editing: false,
  focused: undefined,                                // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: 0,                                         // "Clicked": for Dragging, Deleting.

  // PATCH: WORKING DATA                             // NOTE: data is populated in actions.js
  id: 0,
  name: '',
  modules: [],
  connections: [],
  parameterSets: [],
  parameterKey: 0,

  // APP: "PERSISTENT" STORAGE
  patchKey: localStorage.getItem(_KEY) || '',        // key of active patch

  // UI: STUFFS
  canvasOffset: 0,

  // TODO: remove; use firebase + SW instead;
  patches: {}                                        // all available patches, cached here
};


// -----------------------------------------------
//  STORE
// -----------------------------------------------

@Store
export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  plugins
  // strict: process.env.NODE_ENV !== 'production'
});
