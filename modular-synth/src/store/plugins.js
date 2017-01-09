import Vue from 'vue';
import { STORAGE_KEY_MODULES, STORAGE_KEY_CONNECTIONS } from './index';
// import createLogger from 'vuex/logger';


const localStoragePlugin = (store) => {
  store.subscribe((mutation, { modules }) => {
    localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(modules));
  });
  store.subscribe((mutation, { connections }) => {
    if (connections !== undefined) {
      localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
    }
  });
  store.subscribe((mutation, { id }) => {
    localStorage.setItem('id', id);
  });
};

const webAudioPlugin = (store) => {
  store.subscribe((mutation) => {
    if (mutation.type === 'LOAD') {
      Vue.nextTick(function() {   // WHYWHYWHY TODO TODO ????
        console.log('Nodes loaded, now routing audio...');
        store.state.connections = JSON.parse(localStorage.getItem(STORAGE_KEY_CONNECTIONS) || '[]');
      });
      // end of WTF ------------------------------
    }
  });
};


export default [localStoragePlugin, webAudioPlugin];
