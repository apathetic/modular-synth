import { RootState } from '../types/';
import { _ID, _NAME, _MODULES, _CONNECTIONS, _PARAMETERS, _PARAMETER_KEY } from './patch';
import { _KEY } from './app';
import { Mutation, MutationPayload, Payload, Plugin, Store } from 'vuex';


const localStoragePlugin: Plugin<RootState> = (store: Store<RootState>) => {
  store.subscribe((mutation: MutationPayload, { patch: { name }}) => {
    localStorage.setItem(_NAME, name);
  });
  
  store.subscribe((mutation: MutationPayload, { patch: { modules }}) => {
    localStorage.setItem(_MODULES, JSON.stringify(modules));
  });

  store.subscribe((mutation: MutationPayload, { patch: { connections }}) => {
    localStorage.setItem(_CONNECTIONS, JSON.stringify(connections));
  });

  store.subscribe((mutation: MutationPayload, { patch: { parameterSets }}) => {
    localStorage.setItem(_PARAMETERS, JSON.stringify(parameterSets));
  });

  store.subscribe((mutation: MutationPayload, { patch: { parameterKey }}) => {
    localStorage.setItem(_PARAMETER_KEY, parameterKey.toString());
  });

  store.subscribe((mutation: MutationPayload, { patch: { id }}) => {
    localStorage.setItem(_ID, id.toString());
  });

  store.subscribe((mutation: MutationPayload, { app: { patchKey }}) => {
    localStorage.setItem(_KEY, patchKey);
  });
};

export default [localStoragePlugin];
