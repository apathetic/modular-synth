import { _KEY, _NAME, _MODULES, _CONNECTIONS, _PARAMETERS, _PARAMETER_KEY } from './index';

const localStoragePlugin = (store) => {
  store.subscribe((mutation, { patchKey }) => {
    localStorage.setItem(_KEY, patchKey);
  });
  store.subscribe((mutation, { parameterKey }) => {
    localStorage.setItem(_PARAMETER_KEY, parameterKey);
  });
  store.subscribe((mutation, { name }) => {
    localStorage.setItem(_NAME, name);
  });
  store.subscribe((mutation, { modules }) => {
    localStorage.setItem(_MODULES, JSON.stringify(modules));
  });
  store.subscribe((mutation, { connections }) => {
    localStorage.setItem(_CONNECTIONS, JSON.stringify(connections));
  });
  store.subscribe((mutation, { parameterSets }) => {
    localStorage.setItem(_PARAMETERS, JSON.stringify(parameterSets));
  });
  store.subscribe((mutation, { id }) => {
    localStorage.setItem('id', id);
  });
};

export default [localStoragePlugin];
