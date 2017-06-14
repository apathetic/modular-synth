import { KEY, MODULES_KEY, CONNECTIONS_KEY, PARAMETERS_KEY } from './index';

const localStoragePlugin = (store) => {
  store.subscribe((mutation, { patchKey }) => {
    // if (mutation.type === 'LOAD_PATCH') {
    localStorage.setItem(KEY, patchKey);
  });
  // store.subscribe((mutation, { name }) => {
  //   localStorage.setItem(NAME_KEY, name);
  // });
  store.subscribe((mutation, { modules }) => {
    localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
  });
  store.subscribe((mutation, { connections }) => {
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
  });
  store.subscribe((mutation, { parameters }) => {
    localStorage.setItem(PARAMETERS_KEY, JSON.stringify(parameters));
  });
  store.subscribe((mutation, { id }) => {
    localStorage.setItem('id', id);
  });
};

export default [localStoragePlugin];
