<template>
  <div
    id="modules"
    ref="grid"
    XXXXv-contextmenu:modules
  >
    <div class="position-highlight">
      <div class="inner"></div>
    </div>

    <Unit
      v-for="module in modules"
      :module="module"
      :key="module.id"
      @XXXmousedown.stop="startDragging()"
      @mousedown.native="setActive(module.id)"
      @mouseover.native="setFocus(module.id)"
      @mouseout.native="clearFocus()"
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
        @mousedown.native="setActive(connection.id)">
      </connection>
    </svg>

  </div>
</template>

<script>
  import { context } from '@/audio';
  import { mapGetters, mapActions } from 'vuex';
  import { sortable } from '@/mixins/sortable';
  import { draggable } from '@/mixins/draggable';
  import { EVENT } from '@/events';

  import Connecting from '@/components/system/Connecting.vue';
  import Connection from '@/components/system/Connection.vue';
  import * as Modules from '@/components/';
  import Unit from './Unit';
  import Debugger from '@/components/test/Debugger';

  export default {
    name: 'Rack',
    provide: [ context ],
    mixins: [ sortable ], // draggable

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

    computed: {
      width() {
        const canvasWidth = this.bounds + 124 + 40; // .. + module width + 40
        return this.editing
          ? `width: ${canvasWidth}px`
          : 'width: auto';
      },
      ...mapGetters([
        'editing',
        'bounds',
      ])
    },

    created() {
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
        this.initSorting(this.$refs.grid);
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
    },

    mounted() {
      // const grid = this.$refs.grid; // rare time we need to scrape DOM.
      // grid.addEventListener(EVENT.SCROLL, (e) => {
      //   if (this.editing) {
      //     this.$store.commit('UPDATE_SCROLL_OFFSET', e.target.scrollLeft);
      //   }
      // });
    },

    methods: {
      ...mapActions([
        'setActive',
        'clearActive',
        'setFocus',
        'clearFocus'
      ])
    }
  };
</script>
