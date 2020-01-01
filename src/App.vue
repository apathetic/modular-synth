<template>
  <main>
    <patch-manager></patch-manager>

    <section :class="editing ? 'edit-mode': 'play-mode'"  @click.left="clearActive">

      <Synth
        :modules="modules"
        :connections="connections"
      />

      <aside id="sidebar">
        <div class="controls pad">
          <h4>{{ editing ? 'EDIT MODE' : 'PERFORMANCE MODE' }}</h4>

          <button class="mode" @click="toggleEditMode">
            <span class="play">play</span>
            <span class="edit">edit</span>
          </button>

          <p v-if="activeModule">
            <strong>Current Module</strong><br>
            {{ activeModule.type }} (id: {{ activeModule.id }})<br>
            x, y: {{ activeModule.x }}, {{ activeModule.y }}<br>
            col, row: {{ activeModule.col }}, {{ activeModule.row }}<br>
            w, h: {{ activeModule.w }},  {{ activeModule.h }}<br>
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

    <context-menu></context-menu>
  </main>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex';
  // import { sortable } from './mixins/sortable';
  import { EVENT } from './events';
  import masterOut from './components/system/MasterOut.vue';
  import midi from './components/system/Midi.vue';
  import patchManager from './components/system/PatchManager.vue';
  import contextMenu from './components/system/ContextMenu.vue';


  import connecting from './components/system/Connecting.vue';
  import connection from './components/system/Connection.vue';



  import Synth from './components/system/Synth/';

  export default {
    name: 'App',

    // mixins: [sortable],

    components: {
      Synth,
      masterOut,
      midi,
      contextMenu,
      patchManager
    },

    computed: {
      ...mapGetters([
        'power',
        'editing',
        'activeModule',
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

      window.addEventListener(EVENT.KEY_DOWN, (e) => {
        switch (e.key) {
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
          case ' ':
          case 'Space':
            // this.togglePlay();  // one day, if i plug in a timeline
            break;
          case 'Shift':
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
        switch (e.key) {
          case 'Shift':
            this.sorting = false;
            break;
        }
      });
    },

    methods: {
      ...mapActions([
        'togglePower',
        'toggleEditMode',
        'removeModule',
        'clearActive',
      ])
    }
  };
</script>

<style lang="scss">
  @import 'styles/variables.scss';
  @import 'styles/styles.scss';
  @import 'styles/module.scss';

  #modules {
    display:inline-block;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
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

  #connections {
    min-width: 100%;
    min-height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: opacity 0.1s;
    transition-delay: $transition-time-slow;

    .play-mode & {
      opacity: 0;
      transition-delay: 0s;
      z-index: -1;
    }
  }

  #sidebar {
    background-color: #444;
    display: flex;
    flex-direction: column;
    flex-basis: 112px;
    z-index: 9999;          // as nodes will increment their z-index
  }

  .controls {
    flex: 1;
  }
</style>
