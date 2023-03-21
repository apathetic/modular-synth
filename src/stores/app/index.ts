import { defineStore } from 'pinia'
import * as getters from './getters';
import * as actions from './actions';
import type { AppState, Patch } from '@/types';

const patches = JSON.parse(localStorage.getItem('patches') || 'null');

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  });
};

const blank = () => <Patch>{
  id: uuid(),
  i: 0, // keeps track of modules, augmented when new module is added. could use uuid maybe
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

  patches: patches || [blank()],
  patchId: 0,  // id of the active patch
  configId: 0, // id of the active parameter configuration

  registry: {},

  session: undefined,
  // authenticated: false,
  // canvasOffset: 0,    // UI stuffs
};

const useAppStore = defineStore('app', {
  state,
  getters,
  actions: { ...actions }, // actions
});



export {
  blank,
  useAppStore
};
