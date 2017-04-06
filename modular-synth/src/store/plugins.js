import Vue from 'vue';
import { LS_NAME, LS_MODULES, LS_CONNECTIONS } from './index';
// import createLogger from 'vuex/logger';


const localStoragePlugin = (store) => {
  store.subscribe((mutation, { name }) => {
    localStorage.setItem(LS_NAME, name);
  });
  store.subscribe((mutation, { modules }) => {
    localStorage.setItem(LS_MODULES, JSON.stringify(modules));
  });
  store.subscribe((mutation, { connections }) => {
    if (connections !== undefined) {
      localStorage.setItem(LS_CONNECTIONS, JSON.stringify(connections));
    }
  });
  store.subscribe((mutation, { id }) => {
    localStorage.setItem('id', id);
  });
};

const webAudioPlugin = (store) => {
  store.subscribe((mutation) => {
    if (mutation.type === 'LOAD_PATCH') {
      Vue.nextTick(function() {   // ensure nodes (+ inlets/outlets) are in the DOM
        console.log('All modules loaded, now routing audio...');
        store.state.connections = JSON.parse(localStorage.getItem(LS_CONNECTIONS) || '[]');
      });
    }
  });
};


export default [localStoragePlugin, webAudioPlugin];
