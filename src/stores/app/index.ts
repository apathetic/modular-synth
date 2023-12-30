import { defineStore } from 'pinia'
import * as getters from './getters';
import * as actions from './actions';
import { state as blank } from '../patch';
import type { AppState } from '@/types';

const patches = JSON.parse(localStorage.getItem('patches') || 'null');


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

  // there are referenced in actions but not defined here
  // are the supposed to not be reactive, or what??
  // activeModule ...?
  // patch ???????????????? { name: sring; uuid: string; } as Patch
  // modules: [], // ????
  // connections
  // config ???? { parameters: .... }
  // configs
  // parameters
  //

};

export const useAppStore = defineStore('app', {
  state,
  getters,
  // actions,
  actions: { ...actions }, // actions
});
