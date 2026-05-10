<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { debug } from './debug';
  import { useAppStore } from '~/stores/app';
  import { auth } from '~/utils/db';
  import { log } from '~/utils/logger';
  import Auth from '~/components/synth/Auth';
  import midi from '~/components/synth/Midi.vue';
  import Synth from '~/components/synth/Rack.vue';
  import Power from '~/components/synth/Power.vue';
  import MasterOut from '~/components/synth/MasterOut.vue';
  import PatchManager from '~/components/synth/PatchManager';
  import ContextMenu from '~/components/synth/ContextMenu.vue';


  export default defineComponent({
    name: 'App',

    components: {
      Synth,
      Auth,
      Power,
      MasterOut,
      midi,
      ContextMenu,
      PatchManager
    },

    setup() {
      const store = useAppStore();
      const sorting = ref(false);

      // maybe we want these for a "reset everything" escape hatch:
      // const { resetConnector } = useConnection();
      // const { stopDragging } = useDraggable();


      auth.onAuthStateChange((_, _session) => {
        store.fetchPatches();
      });

      window.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            store.removeModule();
            break;
          case 'Tab':
            e.preventDefault(); // do not tab through <select>, fields, etc
            store.toggleMode();
            break;
          case 'Escape':

            // this.togglePower();
            //  - OR -
            // stopDragging(); /// store.dragging = false // dispatchmouseup
            // store.active = undefined
            // resetConnector(); // activeConnector = undefined;

            break;
          case ' ':
          case 'Space':
            // this.togglePlay();  // one day, if i plug in a timeline
            break;
          case 'Shift':
            // WE only want to rearrange the module-rack if shift is held (...?)
            // otherwise, we probably want to play the module
            // this.toggleSorting;
            sorting.value = true;
            break;
          default:
            // console.log(e.code);
        }
      });

      window.addEventListener('keyup', (e) => {
        switch (e.key) {
          case 'Shift':
            sorting.value = false;
            break;
        }
      });

      log({ type:'system', action: 'setup', data:'Synth' });

      return {
        modules: computed(() => store.rackModules),
        isEditing: computed(() => store.isEditing),
        connections: computed(() => store.connections),
        activeModule: computed(() => store.activeModule),
        isAuthenticated: computed(() => store.isAuthenticated),
        isDev: import.meta.env.DEV,

        toggleMode: store.toggleMode,
        clearActive: store.clearActive,
        fetchPatches: store.fetchPatches,
        removeModule: store.removeModule,
        savePatch: store.savePatch,
        clearAll: store.clear,

        debug,
      };

    }
  });
</script>


<template>
  <main @mousedown="clearActive" :class="isEditing ? 'edit-mode': 'play-mode'">
    <header id="header" :class="[{'loaded': isAuthenticated}, 'pad']">

      <button class="mode" @click="toggleMode">
        <span class="play">play</span>
        <span class="edit">edit</span>
      </button>

      <PatchManager />
      <Power />
    </header>

    <section>
      <Synth :modules="modules" :connections="connections" />

      <aside id="sidebar">
        <midi></midi>

        <p v-if="activeModule">
          <strong>Current Module</strong><br>
          {{ activeModule.type }} (id: {{ activeModule.id }})<br>
          x, y: {{ activeModule.x }}, {{ activeModule.y }}<br>
          col, row: {{ activeModule.col }}, {{ activeModule.row }}<br>
          w, h: {{ activeModule.w }},  {{ activeModule.h }}<br>
        </p>

        <button @click="debug">debug</button>
        <button v-if="isDev" @click="clearAll">clear</button>

        <MasterOut />
      </aside>
    </section>

    <ContextMenu />
  </main>
</template>


<style>
  #header {
    display: flex;
    gap: 1rem;

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



  #sidebar {
    background-color: #444;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    flex-basis: 48px;
    transition: all var(--transition-time-slow);

    /* .edit-mode & { */
    /*   flex-basis: 60px; */
    /* } */
  }



  .mode {
    align-items: center;
    background: var(--color-grey-dark);
    border: 1px solid var(--color-grey-dark);
    border-radius: var(--border-radius);
    box-shadow: inset 0 0.2em 0.6em rgba(0, 0, 0, 0.3);
    color: var(--color-inactive);
    display: flex;
    min-width: 8rem;

    margin: 0;
    font-size: 1.2rem;

  }

    .mode span {
      color: var(--inactive);
      flex: 1;
      z-index: 1;
    }

    .mode:after {
      content: '';
      position: absolute;
      transition: left var(--transition-time);
      background-color: #54bfff8f;
      border-radius: 0.3em;
      width: 50%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 0;
    }

    .mode:hover:after {
      background-color: #349fdf;
    }

    .edit-mode .mode:after {
      left: 50%;
    }


  .play-mode .play { color: var(--color-text-light); }
  .edit-mode .edit { color: #fff; }

</style>
