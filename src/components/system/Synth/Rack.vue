<template>
  <div
    id="modules"
    ref="grid"
    @scroll="onScroll"
    XXXXv-contextmenu:modules
  >

    <div class="position-highlight">
      <div class="inner"></div>
    </div>

    <Unit
      v-for="module in modules"
      :module="module"
      :key="module.type/* type here is okay? to reuse component if already init'd */"
      @mousedown.stop="setActive(module.id)"
      @mouseover.stop="setFocus(module.id)"
      @mouseout.stop="clearFocus()"
    />

    <svg id="connections" :style="width">
      <connecting></connecting>
      <connection v-for="connection in connections"
        :id="connection.id"
        :to="connection.to"
        :from="connection.from"
        :key="connection.id"
        @mousedown="setActive(connection.id)">
      </connection>
    </svg>

  </div>
</template>


<script>
  import { defineComponent, ref, computed, watch, onMounted } from 'vue';
  import { useAppStore } from '@/stores/app';
  import { useSortable } from '@/composables';
  import Connecting from './Connecting.vue';
  import Connection from './Connection.vue';
  import Unit from './Unit.vue';

  export default defineComponent({
    name: 'Rack',

    components: {
      Unit,
      Connecting,
      Connection,
    },

    props: {
      modules: Array,
      connections: Array,
    },

    setup(props) {
      const { initSorting, resetItems, resetItem } = useSortable();
      const store = useAppStore();
      const grid = ref(null); // template $ref

      console.log('%c ◌ Rack: setting up... ', 'background:black;color:white;font-weight:bold');


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

        if (newList.length > oldList.length) {
          // const item = this.modules.slice(-1)[0]; // get last (newest) item
          const item = newList.filter((i) => oldList.indexOf(i) === -1);
          resetItem(item);
          // console.log('added', item);

        } else {
          // this.gridList._pullItemsToLeft();
          // console.log('removed');
        }
      });

      function setActive(id) { store.activeId = id; }
      function clearActive() { store.activeId = undefined; }
      function setFocus(id) { store.focusedId = id; }
      function clearFocus() { store.focusedId = undefined; }
      function onScroll(e) {
        if (store.editing) {
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
