<template>
  <main @mousedown="clearActive">
    <header id="header" :class="[{'loaded': isAuthenticated}, 'pad']">
      <button class="save" @click="savePatch">
        <svg viewBox="0 0 100 100">
          <path fill="currentColor" d="M88.236,43.25c-0.309-14.487-12.151-26.134-26.707-26.134c-9.603,0-18.016,5.06-22.729,12.66   c-1.733-0.51-3.573-0.785-5.473-0.785c-8.27,0-15.322,5.194-18.072,12.501C7.702,43.557,2.151,50.469,2.151,58.678   c0,9.816,7.973,17.811,17.811,17.811h14.331l0.008-5.942H19.954c-6.556,0-11.867-5.329-11.867-11.87   c0-6.557,5.324-11.876,11.867-11.876v-0.003h0.082c0.74-6.68,6.407-11.875,13.282-11.875c3.138,0,6.022,1.086,8.304,2.896   c2.584-8.548,10.513-14.769,19.901-14.769c11.477,0,20.778,9.302,20.778,20.782c0,1.113-0.087,2.211-0.251,3.281   c5.249,1.224,9.159,5.947,9.159,11.564c0,6.557-5.321,11.87-11.858,11.87H65.004l-0.011,5.942h14.339   c9.84,0,17.815-7.976,17.819-17.811C97.152,52.095,93.568,46.328,88.236,43.25z"/>
          <path fill="currentColor" d="M62.223,60.091l-5.743-5.942l-6.29-6.508c-0.293-0.295-0.788-0.286-1.065-0.009l-6.299,6.517l-5.744,5.942   l-2.283,2.362c-0.139,0.139-0.219,0.35-0.219,0.578c0,0.119,0.021,0.235,0.061,0.336c0.115,0.297,0.383,0.48,0.699,0.48h8.641   l0.013,18.368c0,0.552,0.448,1,1,1h9.335c0.552,0,1-0.448,1-1V63.848h8.64c0.31,0,0.582-0.187,0.693-0.479   c0.124-0.319,0.058-0.699-0.166-0.928L62.223,60.091z"/>
        </svg>
      </button>

      <patch-manager></patch-manager>

      <Auth />
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
  import midi from '@/components/system/Midi.vue';
  import Synth from '@/components/system/Synth/';
  import Auth from '@/components/system/Auth'; // signIn
  import masterOut from '@/components/system/MasterOut.vue';
  import patchManager from '@/components/system/PatchManager';
  import contextMenu from '@/components/system/ContextMenu.vue';


  // import { EVENT } from './events';
  // import { useConnection, useDraggable } from '@/composables';


  export default {
    name: 'App',

    components: {
      Synth,
      Auth,
      masterOut,
      midi,
      contextMenu,
      patchManager
    },

    computed: {
      ...mapState(useAppStore, [
          'power',
          'activeModule',
          'isAuthenticated',
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
        'savePatch'
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
  @import 'styles/module.scss';

  #header {
    display: flex;

    .save {
      align-self: center;
      padding: 2px 8px;

      &:hover {
        color: #349fdf;
      }

      svg {
        display: block;
        height: 2em;
      }
    }

    &:not(.loaded) {
      .dropdowns,
      .save {
        z-index: -1;
      }
    }
  }

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
