import { defineStore } from 'pinia'
import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';
import type { AppState } from '@/types';


export const _KEY = 'patchKey';

const state = () => <AppState>{
  power: false,
  editing: false,
  focused: undefined,
  active: 0,

  patches: {},
  patchKey: localStorage.getItem(_KEY) || '',
  configKey: 0,

  registry: {},

  // patch: {
  //   id: 0,
  //   name: '<blank>',
  //   modules: [{ type: 'MasterOut', id: 0, x: 0, y: 0 }],
  //   connections: [],
  //   configs: [{
  //     name: '<blank>',
  //     parameters: []  ......values
  //   }]
  // },


  canvasOffset: 0,                                  // UI stuffs
};

// export default {
export const useAppStore = defineStore('app', {
  state,
  getters,
  // mutations,
  // actions
  actions: {
    loadPatch() {
      console.log('da', actions.loadPatch)
    }
  }
});
