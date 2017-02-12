//------------------------------------------------
//  APPLICATION
// -----------------------------------------------
// Note: much of this code inspired by:
// https://github.com/cwilso/WebAudio
// https://github.com/idflood/Threenodes.js
// https://github.com/gre/zound-live


<template>
  <section :class="editing ? 'edit-mode': 'play-mode'">

    <div
      id="modules"
      class="grid-container"
      ref="grid"
      @click="clearActive">

      <div class="position-highlight">
        <div class="inner"></div>
      </div>

      <component v-for="(module, index) in modules"
        :is="module.type"
        :id="module.id"
        :col="module.col"
        :row="module.row"
        :coords="{ x:module.x, y:module.y }"

        @mousedown.native="setActive(module.id)"
        @mouseover.native="setFocus(module.id)"
        @mouseout.native="clearFocus"

        :key="index">
      </component>

      <svg id="connections">
        <connecting></connecting>
        <connection v-for="connection in connections"
          :id="connection.id"
          :to="connection.to"
          :from="connection.from"

          @mousedown.native="setActive(connection.id)">
        </connection>
      </svg>

    </div>

    <aside id="controls">
      <div class="pad">
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


        <button class="button" @click="newModule('Node')">Node</button>
        <button class="button" @click="newModule('Oscillator')">osc</button>
        <button class="button" @click="newModule('LFO')">LFO</button>
        <button class="button" @click="newModule('Env')">env</button>
        <button class="button" @click="newModule('Reverb')">reverb</button>
        <button class="button" @click="newModule('Filter')">filter</button>
        <button class="button" @click="newModule('Mixer')">mixer</button>
        <button class="button" @click="newModule('multiply')">multiply</button>
        <button class="button" @click="newModule('NoteIn')">note-in</button>

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

    </aside>

  </section>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  import { sortable } from './mixins/sortable';

  import Env from './components/Env';
  import LFO from './components/LFO';
  import Mixer from './components/Mixer';
  import Node from './components/Node';
  import NoteIn from './components/NoteIn';
  import Oscillator from './components/Oscillator';
  import Reverb from './components/Reverb';

  import connecting from './components/system/Connecting';
  import connection from './components/system/Connection';
  import masterOut from './components/system/MasterOut';
  import midi from './components/system/Midi.vue';
  import multiply from './components/math/Multiply';

  export default {
    mixins: [sortable],

    components: {
      masterOut,
      connecting,
      connection,
      midi,
      multiply,

      Env,
      LFO,
      Mixer,
      Node,
      NoteIn,
      Oscillator,
      Reverb
    },

    computed: {
      ...mapGetters([
        'editing',
        'active',
        'modules',
        'connections'
      ])
    },

    data() {
      return {
        // power: false,
        sorting: false
      };
    },

    created() {
      // Important: needed to trigger LOAD mutation (which routes audio, sets up connections, etc.)
      console.log('App loading...');
      this.$store.commit('LOAD');

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

      window.addEventListener('keydown', (e) => {
        switch (e.code) {
          case 'Delete':
          case 'Backspace':
            this.removeModule();
            break;
          case 'Tab':
            this.toggleEditMode();
            break;
          // case 'Escape':
          //   this.togglePower();
          //   break;
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
    },

    mounted() {
      // TODO why cannot move into sortable:ready() ...?
      this.initSorting(this.$refs.grid);

      this.$bus.$on('app:load', () => {
        // this.initSorting(this.$refs.grid);
        this.setupGrid();
      });
    },

    methods: {
      // not sure. keep here, or move to masterOut ?
      // togglePower() {
      //   this.power = !this.power;
      //   if (this.power) {
      //     console.log('audio on');
      //     this.$bus.$emit('audio:start');
      //   } else {
      //     console.log('audio off');
      //     this.$bus.$emit('audio:stop');
      //   }
      // },
      newModule(type) {
        this.$store.commit('ADD_MODULE', type);

        this.$nextTick(function() {
          const id = this.$store.state.id;
          const module = this.$children.find((m) => { return m.id === id; });
          const item = this.modules.find((m) => { return m.id === id; });

          this.$store.commit('REGISTER_DIMENSIONS', {
            id: id,
            w: module.w || 1,
            h: module.h || 1
          });

          module.$el.style.opacity = 0;

          this.gridList.items = this.modules;
          this.gridList.moveItemToPosition(item, [0, 0]);

          setTimeout(() => {
            module.$el.style.opacity = 1;
          }, 200);
        });
      },

      // VUEX actions, bound as local methods:
      ...mapActions([
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
