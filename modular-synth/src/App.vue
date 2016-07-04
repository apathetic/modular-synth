//------------------------------------------------
//  APPLICATION
// -----------------------------------------------

<template>
  <section
    id="modules"
    :class="editing ? 'edit-mode': 'play-mode'"
    v-el:modules
    >
    <!-- @mousemove.prevent.stop="whileDraggingConnector" -->
    <!-- @mouseup="stopDraggingConnector" -->


<!--
  this.handle.addEventListener('mousedown',  (e) => this._dragStart(e));
  this.handle.addEventListener('mousemove',  (e) => this._drag(e));
  this.handle.addEventListener('mouseup',    (e) => this._dragEnd(e));
  this.handle.addEventListener('mouseleave', (e) => this._dragEnd(e));
  this.handle.addEventListener('click', (e) => {
    if (this.dragThresholdMet) { e.preventDefault(); }
  });
 -->

    <component v-for="module in modules"
      :is="module.type"
      :idx="module.idx"
      track-by="$index">
    </component>

  </section>

  <svg id="connections">
    <connector v-for="connector in connectors"
      :to="connector.to"
      :from="connector.from">
    </connector>
  </svg>

  <aside id="controls" v-el:controls>
    <button @click="toggleEditMode">{{ editing ? 'Play Mode' : 'Edit mode' }}</button>
    <button @click="newModule('Node')">add Node</button>
    <button @click="newModule('Oscillator')">add osc</button>

    <div>
      <p>selected Component details / info ? debug?</p>

      <midi></midi>
    </div>

    <button>  ► </button>
    <button>
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
import connector from './components/system/Connector';
import midi from './components/system/Midi.vue';

var idx = 0;

export default {
  components: {
    Oscillator,
    Node,
    connector,
    midi
  },

  data() {
    return {
      editing: true,
      modules: [],
      connectors: [],
      connections: []
    };
  },

  ready() {
    // this.$on('connection:start', this.startDraggingConnector);
    // this.$on('connection:update', this.updateConnections);
    this.$on('connector:new', this.newConnector);
    this.$on('connector:connect', this.connectModules);

    // this.$on('connection:add', this.addConnector);
    // this.$on('connection:remove', this.removeConnector);
  },

  methods: {
    toggleEditMode() {
      this.editing = !this.editing;
    },

    newModule(type) {
      // [TODO] use v-ref instead of idX
      // var N = Vue.extend({
      //   // props: {'type': type, idx: idx++},
      //   data: () => ({'type': type, 'idx': idx++})
      // });

      this.modules.push({
        type: type,
        idx: idx++
      });
    },

    //
    newConnector(from = {}, to = {}) {
      this.connectors.push({
        'to': to,
        'from': from
      });
    },

    // addConnector(line) {
    //   this.connections.push(line);
    // },

    connectModules(connector) {
      let source = connector.from.data;
      let destination = connector.to.data;

      console.log('connecting %s from module #%s to %s in #%s',
        connector.from.outlet.label,
        connector.from.module.idx,
        connector.to.inlet.label,
        connector.to.module.idx
      );

      // functional.
      // TODO: assumes just audio for now. FInd a way to route control data
      if (source && destination) {
        source.connect(destination);
      }
    },


    removeConnector(line) {
      let index = this.connections.indexOf(line);
      this.connections.splice(index, 1);
    },

    deleteModule() {
      var moduleElement = this.parentNode;

      // First disconnect the audio
      this.disconnectNode(moduleElement);

      // Then delete the visual element
      // moduleElement.parentNode.removeChild(moduleElement);
      // "Vue.component remove"
      this.$root.$delete(module);
    }
  }
};

</script>

<style src="assets/scss/styles.scss" lang="scss"></style>
