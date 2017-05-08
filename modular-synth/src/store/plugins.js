import { PATCH_KEY, MODULES_KEY, CONNECTIONS_KEY, PARAMETERS_KEY } from './index';
// import createLogger from 'vuex/logger';


const localStoragePlugin = (store) => {
  store.subscribe((mutation, { key }) => {
    localStorage.setItem(PATCH_KEY, key);
  });
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

const webAudioPlugin = (store) => {
  store.subscribe((mutation) => {
    if (mutation.type === 'LOAD_PATCH') {
      // store.state.modules.forEach((module) => {
      //   if ((!+module.col || !+module.row) && !!module.id) {   // quick check that row / col are not null, undef.
      //     console.log('ERROR: %s #%d does not have rack coords', module.type, module.id);
      //     module.row = 0;
      //     module.col = 0;
      //   }
      // });

      // Vue.nextTick(function() {   // ensure nodes (+ inlets/outlets) are in the DOM
      //   console.log('All modules loaded, now routing audio...');
      //   store.state.connections = JSON.parse(localStorage.getItem(CONNECTIONS_KEY) || '[]');
      // });
    }
  });
};


export default [localStoragePlugin, webAudioPlugin];
