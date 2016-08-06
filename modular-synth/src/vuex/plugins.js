import { STORAGE_KEY_MODULES, STORAGE_KEY_CONNECTIONS } from './store';
import createLogger from 'vuex/logger';


const localStoragePlugin = (store) => {
  store.subscribe((mutation, { modules }) => {
    localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(modules));
  });
  store.subscribe((mutation, { connections }) => {
    localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
  });
};

export default process.env.NODE_ENV !== 'production'
  ? [createLogger(), localStoragePlugin]
  : [localStoragePlugin];
