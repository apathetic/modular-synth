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
      :key="module.id"
      @mousedown.stop.prevent="() => setActive(module.id)"
      @mouseover.stop="setFocus(module.id)"
      @mouseout.stop="clearFocus()"
    >
      <component
        :is="module.type"
        :id="module.id"
      />
    </Unit>

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
  import { defineComponent, ref, onMounted, watch } from 'vue';
  import { useAppStore } from '@/stores/app';
  import { useSortable } from '@/composables';
  import * as Modules from '@/components/';
  import Connecting from '@/components/system/Connecting.vue';
  import Connection from '@/components/system/Connection.vue';
  import Debugger from '@/components/test/Debugger.vue';
  import Unit from './Unit.vue';

  export default defineComponent({
    name: 'Rack',

    components: {
      ...Modules,
      Unit,
      Connecting,
      Connection,
      Debugger,
    },

    props: {
      modules: Array,
      connections: Array,
    },

    setup(props) {
      console.log('%c ◌ Rack: setting up... ', 'background:black;color:white;font-weight:bold');

      // const { modules, connections } = props;

      const { initSorting, resetItems, resetItem } = useSortable();
      const store = useAppStore();
      const grid = ref(null); // template $ref

      // const isEditing = computed(() => store.isEditing);
      // const bounds = computed(() => store.bounds);
      // const width = computed(() => {
      //   const canvasWidth = bounds.value + 124 + 40; // .. + module width + 40
      //   return `width: ${ isEditing ? canvasWidth + 'px' : 'auto' }`;
      // });

      // provide('context', context);


      onMounted(() => {
        initSorting(grid.value, props.modules);
      });

      watch(() => props.modules, (newList, oldList) => {

        // this.$nextTick(function() {
        //   this.gridList.items = this.modules;
        resetItems(newList);

        if (newList.length > oldList.length) {
          let item = newList.filter((o) => oldList.indexOf(o) === -1);
        //   const item = this.modules.slice(-1)[0]; // get last (newest) item

          resetItem(item);
          console.log('added', item);
        //   this.gridList.moveItemToPosition(item, [0, 0]);

        } else {
          console.log('removed');
          // this.gridList._pullItemsToLeft();
        }

      });

      // const active = computed(() => store.active)
      function setActive(id) { store.active = id; }
      function clearActive() { store.active = undefined; }
      function setFocus(id) { store.focused = id; }
      function clearFocus() { store.focused = undefined; }
      function onScroll(e) {
        if (store.editing) {
          // store.scrollOffset = e.target.scrollLeft
        }
      }

      return {
        grid,
        onScroll,
        width: 0,

        setActive,
        clearActive,
        setFocus,
        clearFocus,
      }


    /*
      const bus = this.$root.$bus;
      bus.$on(EVENT.DRAG_START, (coords, el) => {
        if (!this.editing) {
          this.startSorting(); // from sortable mixin
        }
      });

      bus.$on(EVENT.DRAG_ACTIVE, (coords, el) => {
        if (!this.editing) {
          this.whileSorting(el); // from sortable mixin
        }
      });

      bus.$on(EVENT.DRAG_END, () => {
        if (!this.editing) {
          this.stopSorting(); // from sortable mixin
        }
      });



      bus.$on(EVENT.APP_SORT, () => {
        this.initializePositions(this.$refs.grid);
      });

      bus.$on(EVENT.MODULE_ADD, () => {
        this.$nextTick(function() {
          const item = this.modules.slice(-1)[0]; // get last (newest) item

          this.gridList.items = this.modules;
          this.gridList.moveItemToPosition(item, [0, 0]);
        });
      });

      bus.$on(EVENT.MODULE_REMOVE, () => {
        this.$nextTick(() => {
          this.gridList.items = this.modules;
          this.gridList._pullItemsToLeft();
        });
      });
    */

  },


});

</script>
