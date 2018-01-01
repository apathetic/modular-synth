<template>
  <section :class="editing ? 'edit-mode': 'play-mode'">

    <div id="modules" ref="grid" @click.left="clearActive">
      <div class="position-highlight">
        <div class="inner"></div>
      </div>

      <module v-for="(module, index) in modules"
        :module="module"
        :key="module.id"

        @mousedown.native="setActive(module.id)"
        @mouseover.native="setFocus(module.id)"
        @mouseout.native="clearFocus()">
      </module>

      <svg id="connections" :style="width">
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
  import { EVENT } from './events';

  import connecting from './components/system/Connecting';
  import connection from './components/system/Connection';
  import masterOut from './components/system/MasterOut';
  import midi from './components/system/Midi.vue';
  import module from './components/system/Module';

  export default {
    mixins: [sortable],

    components: {
      masterOut,
      connecting,
      connection,
      midi,
      module
    },

    computed: {
      width() {
        const canvasWidth = this.bounds + 124 + 40; // .. + module width + 40
        return this.editing
          ? `width: ${canvasWidth}px`
          : 'width: auto';
      },

      ...mapGetters([
        'power',
        'editing',
        'active',
        'modules',
        'bounds',
        'connections'
      ])
    },

    data() {
      return {
        sorting: false
      };
    },

    created() {
      console.log('%c ◌ Synth: loading... ', 'background:black;color:white;font-weight:bold');

      this.$bus.$on(EVENT.DRAG_START, (coords, el) => {
        if (!this.editing) {
          this.startSorting(); // from sortable mixin
        }
      });

      this.$bus.$on(EVENT.DRAG_ACTIVE, (coords, el) => {
        if (!this.editing) {
          this.whileSorting(el); // from sortable mixin
        }
      });

      this.$bus.$on(EVENT.DRAG_END, () => {
        if (!this.editing) {
          this.stopSorting(); // from sortable mixin
        }
      });

      this.$bus.$on(EVENT.APP_SORT, () => {
        this.initSorting(this.$refs.grid);
      });

      this.$bus.$on(EVENT.MODULE_ADD, () => {
        this.$nextTick(function() {
          const item = this.modules.slice(-1)[0]; // get last (newest) item

          this.gridList.items = this.modules;
          this.gridList.moveItemToPosition(item, [0, 0]);
        });
      });

      this.$bus.$on(EVENT.MODULE_REMOVE, () => {
        this.$nextTick(() => {
          this.gridList.items = this.modules;
          this.gridList._pullItemsToLeft();
        });
      });

      window.addEventListener(EVENT.KEY_DOWN, (e) => {
        switch (e.code) {
          case 'Delete':
          case 'Backspace':
            this.removeModule();
            this.$bus.$emit(EVENT.MODULE_REMOVE);
            break;
          case 'Tab':
            this.toggleEditMode();
            e.preventDefault(); // do not tab through <select>, fields, etc
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

      window.addEventListener(EVENT.KEY_UP, (e) => {
        switch (e.code) {
          case 'ShiftLeft':
          case 'ShiftRight':
            this.sorting = false;
            break;
        }
      });
    },

    mounted() {
      const grid = this.$refs.grid; // rare time we need to scrape DOM.
      grid.addEventListener(EVENT.SCROLL, (e) => {
        if (this.editing) {
          this.$store.commit('UPDATE_SCROLL_OFFSET', e.target.scrollLeft);
        }
      });
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

  #modules {
  // #canvas {
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;



    display:inline-block;
    width: auto;

    &::-webkit-scrollbar {
      width: 1em;
      height: 1em;
    }

    &::-webkit-scrollbar-track {
      background: $color-grey-dark;
    }

    &::-webkit-scrollbar-thumb {
      background-color: $color-grey-medium;
      border: 2px solid $color-grey-dark;
      border-radius: 0.5em;
    }

    &::-webkit-scrollbar-corner {
      background: $color-grey-dark;
    }
  }

  #modules {

  }

  #connections {
    min-width: 100%;
    min-height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    transition: opacity 0.1s;
    // transition-delay: 0.2s;
    transition-delay: $transition-time-slow;

    .play-mode & {
      opacity: 0;
      z-index: -1;
      transition-delay: 0s;
    }
  }

  #sidebar {
    display: flex;
    flex-direction: column;
    flex-basis: 112px;
    background-color: #444;
    z-index: 9999;          // as nodes will increment their z-index
  }

  .controls {
    flex: 1;
  }
</style>
