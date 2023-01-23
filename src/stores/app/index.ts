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
  isEditing: false,
  focusedId: undefined,
  // active: 0,
  activeId: 0,

  patches: [patch()],
  patchKey: 0,
  configKey: 0,

  id: 0, // keeps track of modules, augmented when new module is added. could use uuid maybe
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

  // authenticated: false,
  session: undefined,
  canvasOffset: 0,    // UI stuffs
};




export const useAppStore = defineStore('app', {
  state,
  getters,
  actions: { ...actions }
});
