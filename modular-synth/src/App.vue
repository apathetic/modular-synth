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
        :x="module.x"
        :y="module.y"
        :col="module.col"
        :row="module.row"

        @mousedown.native="setActive(module.id)"
        @mouseover.native="setFocus(module.id)"
        @mouseout.native="clearFocus"

        :key="index">
      </component>

      <svg id="connections">
        <connector v-for="connection in connections"
          :id="connection.id"
          :to="connection.to"
          :from="connection.from"

          @mousedown.stop="setActive(connection.id)">
        </connector>
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
        <button
          class="power"
          :class="power ? 'on' : 'off'"
          @click="togglePower">
            on/off

          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
            <path d="M28,18c0,6.629-5.375,12-12,12C9.371,30,4,24.629,4,18c0-5.223,3.34-9.652,8-11.301v4.41C9.617,12.496,8,15.047,8,18 c0,4.418,3.582,8,8,8s8-3.582,8-8c0-2.953-1.621-5.504-4-6.891v-4.41C24.656,8.348,28,12.777,28,18z M16,16c1.105,0,2-0.895,2-2V4 c0-1.104-0.895-2-2-2s-2,0.896-2,2v10C14,15.105,14.895,16,16,16z" />
          </svg>
        </button>
      </div>

      <master-out></master-out>

    </aside>

  </section>
</template>

<script>
  import { sortable } from './mixins/sortable';

  import Env from './components/Env';
  // import Filter from './components/Filter';
  import LFO from './components/LFO';
  import Mixer from './components/Mixer';
  import Node from './components/Node';
  import NoteIn from './components/NoteIn';
  import Oscillator from './components/Oscillator';
  import Reverb from './components/Reverb';

  import connector from './components/system/Connector';
  import masterOut from './components/system/MasterOut';
  import midi from './components/system/Midi.vue';
  import multiply from './components/math/Multiply';

  import { mapGetters, mapActions } from 'vuex';

  export default {
    mixins: [sortable],

    components: {
      masterOut,
      connector,
      midi,
      multiply,

      Env,
      // Filter,
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
        power: false,
        sorting: false
      };
    },

    created() {
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

      // FileManager (using "commit" as it needs to be synchronous)
      this.$store.commit('LOAD');

      // TODO why cannot move into sortable:ready() ...?
      this.initSorting(this.$els.grid);
    },

    methods: {
      togglePower() {
        this.power = !this.power;
        if (this.power) {
          console.log('audio on');
          // this. $ broadcast('start');
        } else {
          console.log('audio off');
          // this. $ broadcast('stop');
        }
      },
      newModule(type) {
        this.$store.commit('ADD_MODULE', type);

        this.$nextTick(function() {
          const id = this.$store.state.id;
          const module = this.$children.find((m) => { return m.id === id; });
          const item = this.modules.find((m) => { return m.id === id; });


          // this.registerDimensions(id, module.w, module.h);
          this.$store.commit('REGISTER_DIMENSIONS', id, module.w, module.h);


          module.$el.style.opacity = 0;

          this.gridList.items = this.modules;
          this.gridList.moveItemToPosition(item, [0, 0]);

          setTimeout(() => {
            module.$el.style.opacity = 1;
          }, 200);
        });
      },

      // VUEX mutations, bound as local methods:
      // ...mapMutations([
      //   'LOAD'
      // ]),

      // VUEX actions, bound as local methods:
      ...mapActions([
        'toggleEditMode',
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
  @import 'assets/scss/node.scss';
</style>
