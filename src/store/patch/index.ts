import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';
import { PatchState } from '../../types/';

export const _ID = 'id';
export const _NAME = 'name';
export const _MODULES = 'modules';
export const _CONNECTIONS = 'connections';
export const _PARAMETERS = 'parameterSets';
export const _PARAMETER_KEY = 'parameterKey';

export const state: PatchState = {
  id: 0,
  name: '<blank>',
  modules: [{ type: 'MasterOut', id: 0, x: 0, y: 0 }],
  connections: [],
  parameterKey: 0,
  parameterSets: [{
    name: '<blank>',
    parameters: []
  }]
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
