import { _ID, _NAME, _MODULES, _CONNECTIONS, _PARAMETERS, _PARAMETER_KEY } from './patch';
import { _KEY } from './app';
import type { MutationPayload, Plugin, Store } from 'vuex';
import type { RootState } from '../types';


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
















cartStore.$subscribe((mutation, state) => {
  // import { MutationType } from 'pinia'
  mutation.type // 'direct' | 'patch object' | 'patch function'
  // same as cartStore.$id
  mutation.storeId // 'cart'
  // only available with mutation.type === 'patch object'
  mutation.payload // patch object passed to cartStore.$patch()

  // persist the whole state to the local storage whenever it changes
  localStorage.setItem('cart', JSON.stringify(state))
})