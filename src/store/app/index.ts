import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';
import { AppState } from '@/types/';

export const _KEY = 'patchKey';

const state: AppState = {
  power: false,
  editing: false,
  focused: undefined,                               // "Hovered": for Module Info, Connections.  TODO move to $bus?
  active: 0,                                        // "Clicked": for Dragging, Deleting.

  patchKey: localStorage.getItem(_KEY) || '',       // key of active patch
  canvasOffset: 0,                                  // UI stuffs
  registry: {},                                     // references to all audio "nodes" in the app

  // TODO: remove; use firebase + SW instead;
  patches: {}                                       // all available patches, cached here
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
