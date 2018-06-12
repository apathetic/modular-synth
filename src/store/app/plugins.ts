import { RootState, AppState, PatchState } from '../../types/store/';
import { _KEY, } from './index';
import { Mutation, MutationPayload, Payload, Plugin, Store } from 'vuex';

const localStoragePlugin = (store: Store<AppState>) => {
  store.subscribe((mutation: MutationPayload, { patchKey }) => {
    localStorage.setItem(_KEY, patchKey);
  });
};

export default [localStoragePlugin];
