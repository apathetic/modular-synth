import { STORAGE_KEY_MODULES, STORAGE_KEY_CONNECTIONS } from './store';
// import createLogger from 'vuex/logger';


const localStoragePlugin = (store) => {
  store.subscribe((mutation, { modules }) => {
    localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(modules));
  });
  store.subscribe((mutation, { connections }) => {
    localStorage.setItem(STORAGE_KEY_CONNECTIONS, JSON.stringify(connections));
  });
  store.subscribe((mutation, { id }) => {
    localStorage.setItem('id', id);
  });
};

const webAudioPlugin = (store) => {
  store.subscribe((mutation) => {
    if (mutation.type === 'LOAD') {
      console.log('loadin');
      /**
       * Reactify the connections.
       * The connection objects stored in localStorage are just objects in JSON -- they
       * lack the reactvity that we get when adding actual modules with bound listeners
       * to the store; hence, we need to update all the static references.
       */

      // THIS IS THE JSON CONNECTOR. WE NEED THE VUE COMPONENENT CONNECTOR.
      // const connections = store.state.connections;
      // const modules = store.state.modules;

      // for (let connection of connections) {
      //   const connector = window.App.$children.find(function(c) { return c.id === connection.id; });
      //
      //   connector.reactify();
      // }
    }
  });
};


/* */
export default process.env.NODE_ENV !== 'production'
  // ? [createLogger(), webAudioPlugin, localStoragePlugin]
  ? [webAudioPlugin, localStoragePlugin]
  : [webAudioPlugin, localStoragePlugin];
/* */
