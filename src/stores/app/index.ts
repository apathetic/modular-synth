import { defineStore } from 'pinia'
import * as getters from './getters';
import * as actions from './actions';
import type { AppState, Patch } from '@/types';

export const blank = () => <Patch>{
  // _id: uuid(),
  id: 0, // keeps track of modules, augmented when new module is added. could use uuid maybe
  name: '<blank>',
  modules: [{ type: 'MasterOut', id: 0, x: 0, y: 0 }],
  connections: [],
  configs: [{
    name: '<blank>',
    parameters: {}
  }]
};

const state = () => <AppState>{
  power: false,
  isEditing: false,
  focusedId: undefined,
  activeId: 0,

  patches: [blank()],
  patchId: 0,  // id of the active patch
  configId: 0, // id of the active parameter configuration

  registry: [], //  {},

  // authenticated: false,
  session: undefined,
  canvasOffset: 0,    // UI stuffs
};


export const useAppStore = defineStore('app', {
  state,
  getters,
  actions: { ...actions },
  // actions
});
