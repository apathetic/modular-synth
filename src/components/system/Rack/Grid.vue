<script>
  import { createComponent } from '@vue/composition-api';
  import { reactive, computed, ref, watch } from '@vue/composition-api';

  import { useDraggable } from './draggable';
  import { useSortable } from './sortable';


  import GridList from '../assets/vendor/gridList';
  import { rackWidth, rackHeight } from '../constants';
  import { EVENT } from '../events';

  const lanes = 3;
  const dragObj = {
    zIndex: 0,
    cursorStartX: null,
    cursorStartY: null,
    startX: null,
    startY: null
  };

  export default {
    props: {
      name: String
    },

    setup(props, { root }) {
      const store = root.$store;
      console.log(props.name);
      // context.attrs
      // context.slots
      // context.emit
      // context.parent
      // context.root

      const { startDragging, whileDragging, stopDragging } = useDraggable();


      const state = reactive({
        activeModule: computed(() => store.activeModule),
        modules: computed(() => store.modules),
      });

      // onMounted(() => { });
      // onUnmounted(() => { });
      // watch(source, callback, options) { };










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














      return {
        state,
        addTodo
      };
    },

    // render() {} // use <template>

  };

</script>