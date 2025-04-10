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
  },


});

</script>
