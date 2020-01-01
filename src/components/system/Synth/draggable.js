/**
 * Draggable.
 * This mixin enables dragging of a Component. A position Object is updated in the Component's
 * data, and any/all connections to any inputs/outputs are also updated and redrawn.
 * @type {Object}
 */

import { reactive, computed, onMounted, ref, watch } from "@vue/composition-api";
import { useSortable } from './sortable';
import { rackWidth, rackHeight } from '../constants';
import { EVENT } from '../events';
// import  { useStore, useComputed } from 'vuex';

const dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  startX: null,
  startY: null
};

export default {
  props: {
    module: Object
  },

  setup(props, { root }) {
    const { startSorting, whileSorting, stopSorting } = useSortable();
    const store = root.$store;
    const editing = computed(() => store.state.editing); // isEditing TODO
    const isDragging = false;
    const module = props.module;
    let element;

    const state = reactive({
      x: module.x,
      y: module.y,
      position: computed(() => ({
        left: `${ (editing || isDragging) ? state.x : module.col * rackWidth }px`,
        top:  `${ (editing || isDragging) ? state.y : module.row * rackHeight }px`
      })),
    });

    onMounted(() => {
      // the DOM element will be assigned to the ref after initial render
      console.log(root.value); // vm.$el
      element = root.value;
    });

    function startDragging(event) {
      const x = element.offsetLeft;  // Calculate explicity because could be in play mode, in which ...
      const y = element.offsetTop;   // case x,y would not pertain to the actual element coords.

      element.style.zIndex = ++dragObj.zIndex;     // Update element's z-index.

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = event.clientX;
      dragObj.cursorStartY = event.clientY;
      dragObj.startX = x;
      dragObj.startY = y;

      isDragging = true;

      state.x = x;                 // necessary as the module's internal coords may be different if in play mode
      state.y = y;

      // this.$bus.$emit(EVENT.DRAG_START, [x, y], element);
      if (!editing) {
        startSorting();
      }

      // Capture mousemove and mouseup events on the page.
      document.addEventListener(EVENT.MOUSE_MOVE, whileDragging);
      document.addEventListener(EVENT.MOUSE_UP, stopDragging);
    }

    function whileDragging(event) {
      const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
      const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

      // we _always_ want to change the module's coordinates
      // while dragging, whether in editing mode or not:
      state.x = x;
      state.y = y;

      // this.$bus.$emit(EVENT.DRAG_ACTIVE, [x, y], element);
      whileSorting();
    }

    function stopDragging(event) {
      isDragging = false;
      // this.$bus.$emit(EVENT.DRAG_END, this.id);
      stopSorting();

      // we only want to update the Store with the
      // new coordinates if we are in editing mode:
      if (editing) {
        store.commit('UPDATE_GRID_POSITION', {
          id: module.id,
          x: state.x,
          y: state.y
        });
      } else {
        // otherwise, restore the x,y coordinates -- we don't want the
        // module to have moved around when we switch out of play mode
        const previous = store.getters['activeModule'];

        state.x = previous.x;
        state.y = previous.y;
      }

      document.removeEventListener(EVENT.MOUSE_MOVE, whileDragging);
      document.removeEventListener(EVENT.MOUSE_UP, stopDragging);
    }

    return {
      state,
      startDragging,
      whileDragging,
      stopDragging
    }
  }
};
