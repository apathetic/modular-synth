import { PatchState } from '../../types/store/';
import { _ID, _NAME, _MODULES, _CONNECTIONS, _PARAMETERS, _PARAMETER_KEY } from './index';
import { Mutation, MutationPayload, Payload, Plugin, Store } from 'vuex';


const localStoragePlugin = (store: Store<PatchState>) => {
  store.subscribe((mutation: MutationPayload, { name }) => {
    localStorage.setItem(_NAME, name);
  });

  store.subscribe((mutation: MutationPayload, { modules }) => {
    localStorage.setItem(_MODULES, JSON.stringify(modules));
  });

  store.subscribe((mutation: MutationPayload, { connections }) => {
    localStorage.setItem(_CONNECTIONS, JSON.stringify(connections));
  });

  store.subscribe((mutation: MutationPayload, { parameterSets }) => {
    localStorage.setItem(_PARAMETERS, JSON.stringify(parameterSets));
  });

  store.subscribe((mutation: MutationPayload, { parameterKey }) => {
    localStorage.setItem(_PARAMETER_KEY, parameterKey.toString());
  });

  store.subscribe((mutation: MutationPayload, { id }) => {
    localStorage.setItem(_ID, id.toString());
  });
};

export default [localStoragePlugin];
