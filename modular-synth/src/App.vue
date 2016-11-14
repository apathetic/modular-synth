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
    ref="grid"
    @click="clearActive">

      <div class="position-highlight">
        <div class="inner"></div>
      </div>

      <component v-for="module in modules"
        :is="module.type"
        :id="module.id"
        :x="module.x"
        :y="module.y"
        :col="module.col"
        :row="module.row"

        @mousedown.stop="setActive(module.id)"
        @mouseover="setFocus(module.id)"
        @mouseout="clearFocus()"

        track-by="index">
      </component>

      <svg id="connections">
        <connector v-for="connection in connections"
          :id="connection.id"
          :to="connection.to"
          :from="connection.from"

          @mousedown.stop="setActive(connection.id)">
        </connector>
      </svg>

    </section>

    <aside id="controls">
      <div class="pad">
        <h4>{{ editing ? 'EDIT MODE' : 'PERFORMANCE MODE' }}</h4>

        <button class="mode" @click="toggleEditMode">
          <span class="play">play</span>
          <span class="edit">edit</span>
        </button>

        <p v-if="active">
          <strong>Current Module</strong><br>
          type: {{ active.type }}<br>
          id: {{ active.id }}<br>
          x: {{ active.x }}<br>
          y: {{ active.y }}<br>

          col: {{ active.col }}<br>
          row: {{ active.row }}<br>
          w: {{ active.w }}<br>
          h: {{ active.h }}<br>

          details / info  ..?
        </p>

        <midi></midi>


        <button class="button" @click="newModule('Node')">add Node</button>
        <button class="button" @click="newModule('Oscillator')">osc</button>
        <button class="button" @click="newModule('LFO')">LFO</button>
        <button class="button" @click="newModule('Reverb')">reverb</button>
        <button class="button" @click="newModule('Filter')">filter</button>
        <button class="button" @click="newModule('Mixer')">mixer</button>

        <br>
        <button
          @click="togglePower"
          :class="power ? 'on' : 'off'">
            on/off
          <!-- <object data="/static/images/reset1.svg" style="width:6em;height:3em"></object> -->

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
      getters: {    // TODO these getters are already all in the store.
        editing: (state) => state.editing,
        active: (state) => state.modules.find(function(module) { return module.id === state.active; }),
        modules: (state) => state.modules.filter(function(module) { return module.id !== 0; }),
        connections: (state) => state.connections,
        selected: (state) => state.selected
      },
      // getters: getters,
      actions: actions
    },

    computed: {
      // editing() { return this.$store.getters.editing; }
    },

    components: {
      masterOut,
      connector,
      midi,
      Node,
      Reverb,
      Oscillator,
      LFO,
      Filter,
      Mixer
    },

    data() {
      return {
        power: false,
        sorting: false
      };
    },

    mounted() {
      window.addEventListener('keydown', (e) => {
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
          case 'ShiftLeft':
          case 'ShiftRight':
            // WE only want to rearrange the module-rack if shift is held;
            // otherwise, we probably want to play the module
            // this.toggleSorting;
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
    },

    methods: {
      togglePower() {
        this.power = !this.power;
        if (this.power) {
          console.log('audio on');
          this.$broadcast('start');
        } else {
          console.log('audio off');
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
