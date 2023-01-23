<template>
  <main @mousedown="clearActive">
    <header>
      <patch-manager></patch-manager>
      <!-- <auth /> -->
    </header>

    <section :class="isEditing ? 'edit-mode': 'play-mode'">
      <Synth
        :modules="modules"
        :connections="connections"
      />

      <aside id="sidebar">
        <div class="controls pad">
          <h4>{{ isEditing ? 'EDIT MODE' : 'PERFORMANCE MODE' }}</h4>
          <button class="mode" @click="toggleMode">
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


<script type="ts">
  import { mapState, mapActions } from 'pinia';
  import { useAppStore } from '@/stores/app';
  import { auth } from '@/utils/supabase';
  import { log } from '@/utils/logger';
  import Synth from './components/system/Synth/';
  import midi from './components/system/Midi.vue';
  import masterOut from './components/system/MasterOut.vue';
  import contextMenu from './components/system/ContextMenu.vue';
  import patchManager from './components/system/PatchManager.vue';


  // import { EVENT } from './events';
  // import { useConnection, useDraggable } from '@/composables';


  export default {
    name: 'App',

    components: {
      Synth,
      masterOut,
      midi,
      contextMenu,
      patchManager
    },

    computed: {
      ...mapState(useAppStore, [
          'power',
          'activeModule',
          // 'authenticated',
          'isEditing',
          'patch',
          'connections'
          // 'modules'
      ]),


      // // TODO find a better way to accommodate MasterOut:
      ...mapState(useAppStore, {
        'modules': (state) => state.modules.filter((m) => m.id !== 0)
      }),
      // connections() { return this.patch.connections },
      // modules() { return this.patch.modules }
    },

    data() {
      return {
        sorting: false,
        // authenticated: false
      };
    },

    beforeCreate() {
      const store = useAppStore();
      // const auth = getAuth();

      // onAuthStateChanged(auth, (user) => {
      //   store.isAuthenticated = !!user;
      //   if (!!user) {
      //     this.fetchPatches();
      //   }
      // });
      auth.getSession().then(({ data }) => {
        // session.value = data.session
        const { session } = data;
        // const { user } = session;

        store.session = session;
      })

      auth.onAuthStateChange((_, _session) => {
        // session.value = _session
          this.fetchPatches();
      });
    },

    created() {
      log({ type:'system', action:'loading...' });
      // const { store } = useAppStore();
      // const { resetConnector } = useConnection();
      // const { stopDragging } = useDraggable();

      window.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            this.removeModule();
            // this.$bus.$emit(EVENT.MODULE_REMOVE);
            break;
          case 'Tab':
            e.preventDefault(); // do not tab through <select>, fields, etc
            this.toggleMode();
            break;
          case 'Escape':

            // this.togglePower();

            // stopDragging(); /// store.dragging = false // dispatchmouseup
            // store.active = undefined
            // resetConnector(); // activeConnector = undefined;

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

      window.addEventListener('keyup', (e) => {
        switch (e.key) {
          case 'Shift':
            this.sorting = false;
            break;
        }
      });
    },

    methods: {
      ...mapActions(useAppStore, [
        'togglePower',
        'toggleMode',
        'clearActive',
        'fetchPatches',
        'removeModule',
      ]),


      xxx(x) {
        console.log('this shouldn fire', x);
        this.clearActive();
      }
    }
  };
</script>


<style lang="scss">
  @import 'styles/variables.scss';
  /* @import 'styles/styles.scss'; */
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
      background: var(--color-grey-dark);
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--color-grey-medium);
      border: 2px solid var(--color-grey-dark);
      border-radius: 0.5em;
    }

    &::-webkit-scrollbar-corner {
      background: var(--color-grey-dark);
    }
  }

  #connections {
    min-width: 100%;
    min-height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    transition: opacity 0.1s;
    transition-delay: var(--transition-time-slow);

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
