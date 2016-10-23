//------------------------------------------------
//  APPLICATION
// -----------------------------------------------
// Note: much of this code inspired by:
// https://github.com/cwilso/WebAudio
// https://github.com/idflood/Threenodes.js
// https://github.com/gre/zound-live


<template>
  <main :class="editing ? 'edit-mode': 'play-mode'">
    <section
    id="modules"
    class="grid-container"
    v-el:grid
    @click="clearActive">

      <div class="position-highlight">
        <div class="inner"></div>
      </div>

      <!-- modules: {{ modules|json }}<br><br> -->
      <!-- conec: {{ connectors|json }} -->
      <!-- selected: {{ selected|json }} -->

      <component v-for="module in modules"  v-if="module.id !== 0"
        :is="module.type"
        :id="module.id"
        :x="module.x"
        :y="module.y"
        :col="module.col"
        :row="module.row"

        @mousedown.stop="setActive(module.id)"
        @mouseover="setFocus(module.id)"
        @mouseout="clearFocus()"

        track-by="$index">
      </component>

      <svg id="connections">
        <connector v-for="connector in connectors"
          :id="connector.id"
          :to="connector.to"
          :from="connector.from"

          @mousedown.stop="setActive(connector.id)">
        </connector>
      </svg>

    </section>

    <aside id="controls">
      <h4>{{ editing ? 'EDIT MODE' : 'PERFORMANCE MODE' }}</h4>

      <button class="mode" @click="toggleEditMode">
        <span class="play">play</span>
        <span class="edit">edit</span>
      </button>



      <div>
        <p v-if="module">
          <h4>Current Module</h4>
          type: {{ module.type }}<br>
          id: {{ module.id }}<br>
          x: {{ module.x }}<br>
          y: {{ module.y }}<br>

          col: {{ module.col }}<br>
          row: {{ module.row }}<br>
          w: {{ module.w }}<br>
          h: {{ module.h }}<br>

          details / info  ..?
        </p>
        <midi></midi>
      </div>

      <div>
        <button class="button" @click="newModule('Node')">add Node</button>
        <button class="button" @click="newModule('Oscillator')">osc</button>
        <button class="button" @click="newModule('LFO')">LFO</button>
        <button class="button" @click="newModule('Reverb')">reverb</button>
        <button class="button" @click="newModule('Filter')">filter</button>
        <button class="button" @click="newModule('Mixer')">mixer</button>

        <button class="button">  ► </button>
        <button
          @click="togglePower"
          :class="power ? 'on' : 'off'">
          Audio (power) On
          <img src="/static/images/reset1.svg" style="max-width:3em">
        </button>
      </div>

      <master-out></master-out>

    </aside>
  </main>
</template>

<script>
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

  import * as actions from './store/actions';

  export default {
    mixins: [sortable],

    vuex: {
      getters: {
        editing: (state) => state.editing,
        module: (state) => state.modules.find(function(module) { return module.id === state.active; }),
        modules: (state) => state.modules,
        // connection: (state) => state.activeConnection,
        connectors: (state) => state.connections,
        selected: (state) => state.selected
      },
      actions: actions
    },

    components: {
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
        sorting: false
        // editing: true
      };
    },

    ready() {
      window.addEventListener('keydown', (e) => {
        switch (e.code) {
          case 'Delete':
          case 'Backspace':
            console.log('delete');
            this.removeModule();
            break;
          case 'Tab':
            console.log('tab');
            this.toggleEditMode();
            break;
          case 'Escape':
            console.log('escape');
            this.togglePower();
            break;
          case 'Space':
            console.log('space');
            // this.togglePlay();
            break;
          case 'ShiftLeft':
          case 'ShiftRight':
            // WE only want to rearrange the module-rack if shift is held;
            // otherwise, we probably want to play the module
            // this.toggleSorting;
            console.log('shift');
            this.sorting = true;
            break;
          default:
            console.log(e.code);
        }
      });

      window.addEventListener('keyup', (e) => {
        switch (e.code) {
          case 'ShiftLeft':
          case 'ShiftRight':
            this.sorting = false;
            break;
        }
      });

      this.load();
      this.initSorting(this.$els.grid); // TODO why cannot move into sortable:ready() ...?
      // this.gridList.generateGrid();
    },

    methods: {
      togglePower() {
        this.power = !this.power;
        if (this.power) {
          this.$broadcast('start');
        } else {
          this.$broadcast('stop');
        }
      },
      newModule(type) {
        this.addModule(type);

        this.gridList.items = this.modules;
        this.gridList.generateGrid();
      }
    },

    events: {
      'drag:start'(coords, el) {
        if (!this.editing) {
          this.startSorting();
        }
      },
      'drag:active'(coords, el) {
        if (!this.editing) { //  this.sorting) {
          this.whileSorting(el);
        }
      },
      'drag:end'() {
        if (!this.editing) {
          this.stopSorting();
        }
      }
    }
  };
</script>

<style lang="scss">
  @import 'assets/scss/variables.scss';
  @import 'assets/scss/styles.scss';
  @import 'assets/scss/node.scss';
</style>
