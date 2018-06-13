import * as getters from './getters';
import * as mutations from './mutations';
import * as actions from './actions';
import plugins from './plugins';
import { PatchState } from '../../types/store/';

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
    name: '<empty>',
    parameters: []
  }]
};

export default {
  state,
  getters,
  mutations,
  actions,
  plugins
};



