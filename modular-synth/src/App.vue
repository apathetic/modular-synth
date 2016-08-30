//------------------------------------------------
//  APPLICATION
// -----------------------------------------------
// Note: much of this code inspired by:
// https://github.com/cwilso/WebAudio
// https://github.com/idflood/Threenodes.js
// https://github.com/gre/zound-live


<template>

  <section
  id="modules"
  class="grid-container"
  v-el:grid
  :class="editing ? 'edit-mode': 'play-mode'"
  @click="resetSelected">

    <node v-for="item in items"
      :id="$index"
      :w="item.w"
      :h="item.h"
      :x="item.x"
      :y="item.y"

      :height="item.height"
      :width="item.width"
      :left="item.left"
      :top="item.top"
      >
      <div class="inner"> {{ $index }}</div>
    </node>


    <!-- modules: {{ modules|json }}<br><br> -->
    <!-- conec: {{ connectors|json }} -->
    <!-- selected: {{ selected|json }} -->

    <component v-for="module in modules"  v-if="module.id !== 0"
      :is="module.type"
      :id="module.id"
      :x="module.x"
      :y="module.y"
      track-by="$index">
    </component>

    <svg id="connections">
      <connector v-for="connector in connectors"
        :id="connector.id"
        :to="connector.to"
        :from="connector.from">
      </connector>
    </svg>
  </section>

  <aside id="controls" v-el:controls>

    <div>
      <p v-if="module">
        Current Module: {{ module.type }}<br>
        id: {{ module.id }}<br>
        x: {{ module.x }}<br>
        y: {{ module.y }}<br>
        details / info  ..?
      </p>
      <midi></midi>
    </div>

    <div>
      <button @click="toggleEditMode">{{ editing ? 'Play Mode' : 'Edit mode' }}</button>
      <button @click="newModule('Node')">add Node</button>
      <button @click="newModule('Oscillator')">osc</button>
      <button @click="newModule('LFO')">LFO</button>
      <button @click="newModule('Reverb')">reverb</button>
      <button @click="newModule('Filter')">filter</button>
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

  </aside>
</template>

<script>
// import GridTest from './components/gridTEST';
import { sortable } from './mixins/sortable';

import Node from './components/Node';
import Reverb from './components/Reverb';
import Oscillator from './components/Oscillator';
import LFO from './components/LFO';
import Filter from './components/Filter';
import Mixer from './components/Mixer';

import masterOut from './components/system/MasterOut';
import connector from './components/system/Connector';
import midi from './components/system/Midi.vue';

import * as actions from './vuex/actions';

export default {
  mixins: [sortable],

  vuex: {
    getters: {
      module: state => state.modules.find(function(module) { return module.id === state.activeModule; }),
      modules: state => state.modules,
      // connection: state => state.activeConnection,
      connectors: state => state.connections,
      selected: state => state.selected
    },
    actions: actions
  },

  components: {
    // GridTest,
    masterOut,
    connector,
    Node,
    Reverb,
    Oscillator,
    LFO,
    Filter,
    Mixer,
    midi
  },

  data() {
    return {
      power: false,
      editing: true
    };
  },

  ready() {
    console.log('c)');
    window.addEventListener('keydown', (e) => {
      console.log(e.code);
      switch (e.code) {
        case 'Delete':
        case 'Backspace':
          this.removeModule();
          break;
        case 'Tab':
          this.toggleEditMode();
          break;
        case 'Escape':
          this.togglePower();
          break;
        case 'Space':
          // this.togglePlay();
          break;
      }
    });
    this.load(false); // false: don't load any external json; just use what was left in localStorage (if any)

    //
    //

    // SORTABLE:
    this.handle = this.$els.grid;
    this._init();
    // this._bindEvents();
    // window.addEventListener('resize', function() {
    //   this.gridList.resizeGrid(this.options.lanes);   // mmm, this is unbound, here. () => prolly wont work neither
    // }.bind(this));
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

  }
};

</script>

<style src="assets/scss/styles.scss" lang="scss"></style>
