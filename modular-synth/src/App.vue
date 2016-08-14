//------------------------------------------------
//  APPLICATION
// -----------------------------------------------
// Note: much of this code inspired by:
// https://github.com/cwilso/WebAudio
// https://github.com/idflood/Threenodes.js
// https://github.com/gre/zound-live


<template>
  <section id="modules"
    :class="editing ? 'edit-mode': 'play-mode'"
    v-el:modules>

    module: {{ module }}<br><br>
    connection: {{ connection }}<br><br>
    modules: {{ modules|json }}<br><br>
    conec: {{ connectors|json }}

    <component v-for="module in modules"
      :is="module.type"
      :id="module.id"
      :x="module.x"
      :y="module.y"
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

    <div>
      <p>selected Component details / info ? debug?</p>
      <midi></midi>
    </div>

    <div>
      <button @click="toggleEditMode">{{ editing ? 'Play Mode' : 'Edit mode' }}</button>
      <button @click="newModule('Node')">add Node</button>
      <button @click="newModule('Oscillator')">add osc</button>
      <button @click="newModule('Mixer')">mixer</button>

      <button>  ► </button>
      <button
        @click="togglePower"
        :class="power ? 'on' : 'off'">
        Audio (power) On
        <img src="/static/images/reset1.svg" style="max-width:3em">
      </button>
    </div>

    <master-out></master-out>
    <!-- <input id="masterOut1" type="range" min="0.0" max="1.0" step="0.1" value="0.0" /> -->
    <!-- <input id="masterOut2" type="range" min="0.0" max="1.0" step="0.1" value="0.0" /> -->


  </aside>
</template>

<script>

import Oscillator from './components/Oscillator';
import Node from './components/Node';
import Mixer from './components/Mixer';

import masterOut from './components/system/MasterOut';
import connector from './components/system/Connector';
import midi from './components/system/Midi.vue';

import * as actions from './vuex/actions';

export default {
  vuex: {
    getters: {
      module: state => state.activeModule,
      modules: state => state.modules,
      connection: state => state.activeConnection,
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
    }

    // connectModules(connector) {
    //   let source = connector.from.data;
    //   let destination = connector.to.data;
    //
    //   console.log('connecting %s from node %s --> %s in node %s',
    //     connector.from.label,
    //     connector.from.module.id
    //     // connector.to.label,
    //     // connector.to.module.id
    //   );
    //
    //   // TODO: assumes just audio for now. FInd a way to route control data
    //   if (source && destination) {
    //     source.connect(destination);
    //   }
    // }
    //

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
