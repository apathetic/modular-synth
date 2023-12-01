import { defineStore } from 'pinia'
import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';
import type { Patch, PatchState } from '@/types';

export const _ID = 'id';
export const _NAME = 'name';
export const _MODULES = 'modules';
export const _CONNECTIONS = 'connections';
export const _PARAMETERS = 'parameterSets';
export const _PARAMETER_KEY = 'parameterKey';

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  });
};
// export const state = () => <PatchState>{
export const state = () => <PatchState>{
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

// // export default {
export const usePatchStore = defineStore('patch', {
//   state,
//   getters,
//   // mutations,
//   actions
});
