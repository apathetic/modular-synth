import Vue from 'vue';
import store from './store/store';
import App from './App';
import FileManager from './FileManager';

const context = window.AudioContext && (new window.AudioContext());

// All Components will have access to AudioContext
// oh.. although *now*, that includes Connectors
Vue.mixin({
  data() {
    return {
      context: context
    };
  }
});

Vue.partial('inlets', '<div class="inlets"><span v-for="inlet in inlets" data-label="{{ inlet.label }}" class="inlet"></span></div>');
Vue.partial('outlets', '<div class="outlets"><span v-for="outlet in outlets" @mousedown.stop="newConnection(outlet)" data-label="{{ outlet.label }}" class="outlet"></span></div>');


/* eslint-disable no-new */
new Vue({
  store,
  el: 'body',
  components: { App, FileManager }
});


/* ------------------------------------
   Global Routing Functions
   ------------------------------------ */

/**
 * Reactify the connections.
 * The connection objects stored in localStorage are just objects in JSON -- they
 * lack the reactvity that we get when adding actual modules with bound listeners
 * to the store; hence, we need to update all the static references.
 * @return {[type]} [description]
 * /
function bindConnections() {
  const connections = store.state.connections;
  const modules = store.state.modules;

  const load = new Event('load');  // eslint-disable-line
  window.dispatchEvent(load);


  for (let connection of connections) {
    const fromId = connection.from.module.id;
    connection.from.module = modules.find(function(m) { return m.id === fromId; });

    const toId = connection.to.module.id;
    connection.to.module = modules.find(function(m) { return m.id === toId; });

    // well... if the module has yet to init, its inputs/outputs will not exist
    // setTimeout(function() {
    connect(connection);
    // }, 1000);
  }
};

/* */

/**
 * Route an Audio connection.
 * @param  {Connector} connection Contains references to both source and destination audio nodes.
 * @return {void}
 * /
function connect(connection) {
  const source = connection.from.data;
  const destination = connection.to.data;

  // const module = App.$children.find(function(m) { return m.$el.contains(outlet.port); });

  // const App = this.$parent;
  const module = App.$children.find(function(m) { return m.id === connection.from.id; });
  console.log(module);
  debugger;

  if (source && destination) {
    console.log('connecting %s --> %s', connection.from.label, connection.to.label);
    source.connect(destination);
  }
}

/* */
