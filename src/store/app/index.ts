import plugins from './plugins';
import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';
import { AppState } from '../../types/store/';

export const _KEY = 'patchKey';

// APP: USER STATE
const state: AppState = {
  power: false,
  editing: false,
  focused: undefined,                                // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: 0,                                         // "Clicked": for Dragging, Deleting.

  // APP: "PERSISTENT" STORAGE
  patchKey: localStorage.getItem(_KEY) || '',        // key of active patch

  // UI: STUFFS
  canvasOffset: 0,

  // TODO: remove; use firebase + SW instead;
  patches: {}                                        // all available patches, cached here
};


export default {
  state,
  getters,
  mutations,
  actions,
  plugins
  // strict: process.env.NODE_ENV !== 'production'
};
