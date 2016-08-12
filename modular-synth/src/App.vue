//------------------------------------------------
//  APPLICATION
// -----------------------------------------------

<template>
  <section id="modules"
    :class="editing ? 'edit-mode': 'play-mode'"
    v-el:modules>

    active: {{ active|json }}<br><br>
    modules: {{ modules|json }}<br><br>
    conec: {{ connectors|json }}

    <component v-for="module in modules"
      :is="module.type"
      :id="module.id"
      track-by="$index">
    </component>

  </section>

  <svg id="connections">
    <connector v-for="connector in connectors"
      :id="connector.id"
      :to="connector.to"
      :from="connector.from">
    </connector>
  </svg>

  <aside id="controls" v-el:controls>
    <button @click="toggleEditMode">{{ editing ? 'Play Mode' : 'Edit mode' }}</button>
    <button @click="newModule('Node')">add Node</button>
    <button @click="newModule('Oscillator')">add osc</button>
    <button @click="newModule('Mixer')">mixer</button>
    <button @click="newModule('masterOut')">add masterout</button>

    <div>
      <p>selected Component details / info ? debug?</p>

      <midi></midi>
    </div>

    <button>  ► </button>
    <button
      @click="togglePower"
      :class="power ? 'on' : 'off'">
      Audio (power) On
      <img src="/static/images/reset1.svg">
    </button>
    <!-- <master-out></master-out> -->
    <input id="masterOut1" type="range" min="0.0" max="1.0" step="0.1" value="0.0" />
    <input id="masterOut2" type="range" min="0.0" max="1.0" step="0.1" value="0.0" />
  </aside>
</template>

<script>
// Note: much of this code inspired by:
// https://github.com/cwilso/WebAudio
// https://github.com/idflood/Threenodes.js
// https://github.com/gre/zound-live

import Oscillator from './components/Oscillator';
import Node from './components/Node';
import Mixer from './components/Mixer';
import masterOut from './components/MasterOut';
import connector from './components/system/Connector';
import midi from './components/system/Midi.vue';

import * as actions from './vuex/actions';

export default {
  vuex: {
    getters: {
      active: state => state.active,
      modules: state => state.modules,
      connectors: state => state.connections
    },
    actions: actions
  },

  components: {
    masterOut,
    Oscillator,
    Mixer,
    Node,
    connector,
    midi
  },

  data() {
    return {
      power: false,
      editing: true
    };
  },

  // ready() {
  //   this.$on('connector:new', this.newConnector);
  //   this.$on('connector:connect', this.connectModules);
  // },

  methods: {
    toggleEditMode() {
      this.editing = !this.editing;
    },

    togglePower() {
      this.power = !this.power;
      if (this.power) {
        this.$broadcast('start');
      } else {
        this.$broadcast('stop');
      }
    },


    // newConnector(from, to = {}) {
    //   const connector = {
    //     to: to,
    //     from: from
    //   };
    //
    //   // from.connections.push(this);
    //   this.connectors.push(connector);
    // },

    connectModules(connector) {
      let source = connector.from.data;
      let destination = connector.to.data;

      console.log('connecting %s from node %s --> %s in node %s',
        connector.from.label,
        connector.from.module.id
        // connector.to.label,
        // connector.to.module.id
      );

      // TODO: assumes just audio for now. FInd a way to route control data
      if (source && destination) {
        source.connect(destination);
      }
    }


    // removeConnector(line) {
    //   let index = this.connections.indexOf(line);
    //   this.connections.splice(index, 1);
    // },

    // deleteModule() {
    //   var moduleElement = this.parentNode;
    //
    //   // First disconnect the audio
    //   this.disconnectNode(moduleElement);
    //
    //   // Then delete the visual element
    //   // module.$destroy(true);
    // }
  }
};

</script>

<style src="assets/scss/styles.scss" lang="scss"></style>
