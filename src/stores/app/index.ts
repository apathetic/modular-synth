import { defineStore } from 'pinia'
import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';
import type { AppState } from '@/types';
import type { PatchState } from '@/types';

export const patch = () => <PatchState>{
  id: 0,
  name: '<blank>',
  modules: [{ type: 'MasterOut', id: 0, x: 0, y: 0 }],
  connections: [],
  configs: [{
    name: '<blank>',
    parameters: []
  }]
};

const state = () => <AppState>{
  power: false,
  editing: false,
  focused: undefined,
  active: 0,

  patches: [patch()],
  patchKey: 0,
  configKey: 0,

  registry: [], //  {},

  // patch: {
  //   id: 0,
  //   name: '<blank>',
  //   modules: [{ type: 'MasterOut', id: 0, x: 0, y: 0 }],
  //   connections: [],
  //   configs: [{
  //     name: '<blank>',
  //     parameters: []
  //   }]
  // },

  authenticated: false,
  canvasOffset: 0,    // UI stuffs
};


// interface Store {
//   AppState,
//   AppGetters,
//   AppActions
// }

export const useAppStore = defineStore('app', {
  state,
  getters,
  // mutations,

  // actions

  actions: { ...actions }

  // actions: {
  //   loadPatch() { actions.loadPatch(); }
  // }
});
