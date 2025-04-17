<script lang="ts">
  import { defineComponent, ref, watch, onMounted } from 'vue';
  import { log } from '@/utils/logger';
  import { useAppStore } from '@/stores/app';
  import { useSortable } from '@/composables';
  import Connecting from './Connecting.vue';
  import Connect from './Connection';
  import Unit from './Unit.vue';
  import type { Module, Connection } from '@/types/generated';

  export default defineComponent({
    name: 'Rack',

    components: {
      Unit,
      Connecting,
      Connection: Connect,
    },

    props: {
      modules: {
        type: Array<Module>,
        required: true
      },
      connections: {
        type: Array<Connection>,
        required: true
      }
    },

    setup(props) {
      const { initSorting, resetSorting, resetItems, resetItem } = useSortable();
      const store = useAppStore();
      const grid = ref(null); // template $ref

      log({ type:'system', action: 'setup', data:'Rack' });


      /*
      const width = computed(() => {
        // const canvasWidth = store.bounds + 124 + 40; // .. + module width + 40
        // return `width: ${ store.isEditing ? canvasWidth + 'px' : 'auto' }`;
        return `width: ${
          !grid.value ? 'auto' :
          !store.isEditing ? 'auto' :
          `${grid.value.scrollWidth + 164}px`
        }`;
      });
      */

      onMounted(() => {
        initSorting(grid.value, props.modules);
      });

      watch(() => props.modules, (newList, oldList) => {
        resetItems(newList);

        if (newList.length - oldList.length === 1) {
          // const item = this.modules.slice(-1)[0]; // get last (newest) item
          const item = newList.filter((i) => oldList.indexOf(i) === -1);
          resetItem(item);
          // console.log('added', item);

        }
        // if (oldList.length - newList.length === 1) {
          // this.gridList._pullItemsToLeft();
          // console.log('removed');
        // }
      });

      watch(() => [store.patchId], () => {
        resetSorting();
      });


      function setActive(id: number) { store.activeId = id; }
      function clearActive()         { store.activeId = undefined; }
      function setFocus(id: number)  { store.hoveredId = id; }
      function clearFocus()          { store.hoveredId = undefined; }
      function onScroll(e: Event)    {
        if (store.editing) {
          console.log(e.target);
          // store.scrollWidth = e.target.scrollLeft
        }
      }

      return {
        grid,
        onScroll,
        width: 'auto',

        setActive,
        clearActive,
        setFocus,
        clearFocus,
      }
    }
  });
</script>


<template>
  <div
    id="modules"
    ref="grid"
    @scroll="onScroll"
    XXXXv-contextmenu:modules
  >

    <div class="highlight" id="position-outline">
      <div class="inner"></div>
    </div>

    <Unit
      v-for="module in modules"
      :module="module"
      :key="module.type + module.id"
      @mousedown.stop="setActive(module.id)"
      @mouseover.stop="setFocus(module.id)"
      @mouseout.stop="clearFocus()"
    />

    <svg id="connections" :style="width">
      <Connecting />
      <Connection
        v-for="connection in connections"
        :id="connection.id"
        :to="connection.to"
        :from="connection.from"
        :key="connection.id"
        @mousedown="setActive(connection.id)">
      </Connection>
    </svg>

  </div>
</template>


<style lang="scss">
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
    overflow: visible;
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
</style>
