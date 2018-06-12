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

const state: PatchState = {
  id: 0,
  name: '',
  modules: [],
  connections: [],
  parameterSets: [],
  parameterKey: 0,
};

export default {
  state,
  getters,
  mutations,
  actions,
  plugins
};
