//------------------------------------------------
//  APPLICATION
// -----------------------------------------------

<template>
  <section :class="editing ? 'edit-mode': 'play-mode'">
    <div
      id="modules"
      class="grid-container"
      ref="grid"
      @click.left="clearActive"
      >

      <div class="position-highlight">
        <div class="inner"></div>
      </div>

      <component v-for="(module, index) in modules"
        :is="module.type"
        :id="module.id"
        :col="module.col"
        :row="module.row"
        :coords="{ x:module.x, y:module.y }"
        :key="module.id"

        @mousedown.native="setActive(module.id)"
        @mouseover.native="setFocus(module.id)"
        @mouseout.native="clearFocus">
      </component>

      <svg id="connections">
        <connecting></connecting>
        <connection v-for="connection in connections"
          :id="connection.id"
          :to="connection.to"
          :from="connection.from"
          :key="connection.id"

          @mousedown.native="setActive(connection.id)">
        </connection>
      </svg>
    </div>

    <aside id="sidebar">
      <div class="controls pad">
        <h4>{{ editing ? 'EDIT MODE' : 'PERFORMANCE MODE' }}</h4>

        <button class="mode" @click="toggleEditMode">
          <span class="play">play</span>
          <span class="edit">edit</span>
        </button>

        <p v-if="active">
          <strong>Current Module</strong><br>
          {{ active.type }} (id: {{ active.id }})<br>
          x, y: {{ active.x }}, {{ active.y }}<br>
          col, row: {{ active.col }}, {{ active.row }}<br>
          w, h: {{ active.w }},  {{ active.h }}<br>
        </p>

        <midi></midi>

        <br>

        <!-- <button
          class="power"
          :class="power ? 'on' : 'off'"
          @click="togglePower">

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
            <path d="M28,18c0,6.629-5.375,12-12,12C9.371,30,4,24.629,4,18c0-5.223,3.34-9.652,8-11.301v4.41C9.617,12.496,8,15.047,8,18 c0,4.418,3.582,8,8,8s8-3.582,8-8c0-2.953-1.621-5.504-4-6.891v-4.41C24.656,8.348,28,12.777,28,18z M16,16c1.105,0,2-0.895,2-2V4 c0-1.104-0.895-2-2-2s-2,0.896-2,2v10C14,15.105,14.895,16,16,16z" />
          </svg>
        </button> -->
      </div>

      <master-out></master-out>

      <div class="power pad">
        <button
          :class="power ? 'on' : 'off'"
          @click="togglePower">

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
            <path d="M28,18c0,6.629-5.375,12-12,12C9.371,30,4,24.629,4,18c0-5.223,3.34-9.652,8-11.301v4.41C9.617,12.496,8,15.047,8,18 c0,4.418,3.582,8,8,8s8-3.582,8-8c0-2.953-1.621-5.504-4-6.891v-4.41C24.656,8.348,28,12.777,28,18z M16,16c1.105,0,2-0.895,2-2V4 c0-1.104-0.895-2-2-2s-2,0.896-2,2v10C14,15.105,14.895,16,16,16z" />
          </svg>
        </button>
      </div>
    </aside>

  </section>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import { sortable } from './mixins/sortable';

  import Analyser from './components/Analyser';
  import Comb from './components/Comb';
  import Delay from './components/Delay';
  import Env from './components/Env';
  import LFO from './components/LFO';
  import Mixer from './components/Mixer';
  import NoteIn from './components/NoteIn';
  import Reverb from './components/Reverb';
  import VCF from './components/Filter';
  import VCO from './components/VCO';
  import VCA from './components/VCA';

  import Debugger from './components/Debugger';
  import Node from './components/Node';

  import connecting from './components/system/Connecting';
  import connection from './components/system/Connection';
  import masterOut from './components/system/MasterOut';
  import midi from './components/system/Midi.vue';


  export default {
    mixins: [sortable],

    components: {
      masterOut,
      connecting,
      connection,
      midi,

      Env,
      LFO,
      VCF,
      VCO,
      VCA,
      Analyser,
      Comb,
      Debugger,
      Delay,
      Mixer,
      Node,
      NoteIn,
      Reverb
    },

    computed: {
      ...mapGetters([
        'power',
        'editing',
        'active',
        'modules',
        'connections'
      ])
    },

    data() {
      return {
        sorting: false
      };
    },

    created() {
      console.log('◌ App: loading...');

      this.$bus.$on('drag:start', (coords, el) => {
        if (!this.editing) {
          this.startSorting();   // from sortable mixin
        }
      });

      this.$bus.$on('drag:active', (coords, el) => {
        if (!this.editing) { //  this.sorting) {
          this.whileSorting(el); // from sortable mixin
        }
      });

      this.$bus.$on('drag:end', () => {
        if (!this.editing) {
          this.stopSorting();    // from sortable mixin
        }
      });

      this.$bus.$on('module:add', () => {
        console.log('module add');
        this.$nextTick(function() {
          const item = this.modules.slice(-1)[0]; // get last (newest) item

          this.gridList.items = this.modules;
          this.gridList.moveItemToPosition(item, [0, 0]);
        });
      });

      this.$bus.$on('module:remove', () => {
        console.log('module remove');
        this.$nextTick(() => {
          // const deleted = this.modules[this.$store.state.active];
          // this.gridList._deleteItemPositionFromGrid(deleted);

          this.gridList.items = this.modules;
          this.gridList._pullItemsToLeft();
        });
      });

      window.addEventListener('keydown', (e) => {
        switch (e.code) {
          case 'Delete':
          case 'Backspace':
            this.removeModule();
            this.$bus.$emit('module:remove');
            break;
          case 'Tab':
            this.toggleEditMode();
            break;
          case 'Escape':
            // this.togglePower();
            break;
          case 'Space':
            // this.togglePlay();  // one day, if i plug in a timeline
            break;
          case 'ShiftLeft':
          case 'ShiftRight':
            // WE only want to rearrange the module-rack if shift is held;
            // otherwise, we probably want to play the module
            // this.toggleSorting;
            this.sorting = true;
            break;
          default:
            // console.log(e.code);
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
    },

    mounted() {
      console.log('◌ App: mounting...');
      // TODO why cannot move into sortable:ready() ...? A: $refs.grid is not yet in the DOM
      // TODO2 sortable:mounted() ...?
      this.initSorting(this.$refs.grid);
      // this.setupGrid();  // this should be after every module has registered its dimensions
    },

    methods: {
      ...mapActions([
        'togglePower',
        'toggleEditMode',
        'removeModule',
        'setActive',
        'clearActive',
        'setFocus',
        'clearFocus'
      ])
    }
  };
</script>

<style lang="scss">
  @import 'assets/scss/variables.scss';
  @import 'assets/scss/styles.scss';
  @import 'assets/scss/module.scss';
</style>
