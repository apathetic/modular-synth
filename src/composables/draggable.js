/**
 * Draggable.
 * This mixin enables dragging of a Component. A position Object is updated in the Component's
 * data, and any/all connections to any inputs/outputs are also updated and redrawn.
 * @type {Object}
 */

import { computed, ref, reactive, toRefs } from 'vue';
import { useAppStore } from '@/stores/app';
import { EVENT } from '@/events';
import { useSortable } from './sortable';

const dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  startX: null,
  startY: null
};

export function useDraggable(module) {
  const { startSorting, whileSorting, stopSorting } = useSortable();
  const store = useAppStore();
  const isEditing = computed(() => store.isEditing);
  const isDragging = ref(false);
  const id = module.id;
  const coords = reactive({
    x: module.x,
    y: module.y
  });

  function startDragging(event) {
    const element = this.$el; // refers to the calling fn // event.target;
    // const BCR = element.getBoundingClientRect();
    const startX = element.offsetLeft;  // Calculate explicity because could be in play mode, in which...
    const startY = element.offsetTop;   // case x,y would not pertain to the actual element coords

    element.style.zIndex = ++dragObj.zIndex;     // Update element's z-index.

    // Save starting positions of cursor and element.
    dragObj.cursorStartX = event.clientX;
    dragObj.cursorStartY = event.clientY;
    dragObj.startX = startX;
    dragObj.startY = startY;

    isDragging.value = true;

    coords.x = startX;
    coords.y = startY;

    if (!isEditing.value) {
      startSorting();
    }

    // Capture mousemove and mouseup events on the page.
    document.addEventListener(EVENT.MOUSE_MOVE, whileDragging);
    document.addEventListener(EVENT.MOUSE_UP, stopDragging);
  }

  function whileDragging(event) {
    // we _always_ want to change the module's coordinates
    // while dragging, whether in isEditing mode or not:
    coords.x = dragObj.startX + event.clientX - dragObj.cursorStartX;
    coords.y = dragObj.startY + event.clientY - dragObj.cursorStartY;

    if (!store.isEditing) { // !isEditing.value) {
      whileSorting(coords);
    }
  }

  function stopDragging(event) {
    isDragging.value = false;

    if (!store.isEditing) { // !isEditing.value) {
      // restore the x,y coordinates -- we don't want the module
      // to have moved around when we switch out of play mode
      const previous = store.getters['activeModule'];

      coords.x = previous.x;
      coords.y = previous.y;
    } else {
      // otherwise, we only want to update the store with
      // the new coordinates if we are in edit mode:
      stopSorting();
      store.commit('UPDATE_GRID_POSITION', {
        id: id,
        x: coords.x,
        y: coords.y
      });
    }

    document.removeEventListener(EVENT.MOUSE_MOVE, whileDragging);
    document.removeEventListener(EVENT.MOUSE_UP, stopDragging);
  }

  return {
    coords,
    isDragging,
    startDragging,
    whileDragging,
    stopDragging
  }
}
