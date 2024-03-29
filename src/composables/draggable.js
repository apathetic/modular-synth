import { ref } from 'vue';
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


/**
 * Provides drag-and-drop capabiities for a Component.
 * @param {object} coords A reactive alias for the `module`, containing its coords and id
 * @param {number} coords.x
 * @param {number} coords.y
 * @param {number} coords.id
 */
export function useDraggable(coords) {
  const { startSorting, whileSorting, stopSorting } = useSortable();
  const store = useAppStore();
  const isDragging = ref(false);

  function startDragging(event, element) {
    // const element = this.$el; // refers to the calling fn // event.target;
    // const BCR = element.getBoundingClientRect();

    element.style.zIndex = ++dragObj.zIndex;     // Update element's z-index.

    // Save starting positions of current coords, cursor and element.
    dragObj.x = coords.x;
    dragObj.y = coords.y;
    dragObj.cursorStartX = event.clientX;
    dragObj.cursorStartY = event.clientY;
    dragObj.startX = element.offsetLeft;  // Calculate explicity because could be in play mode, in which
    dragObj.startY = element.offsetTop;   // case x,y would not pertain to the actual element coords

    isDragging.value = true;

    coords.x = dragObj.startX;
    coords.y = dragObj.startY;

    if (!store.isEditing) {
      startSorting();
    }

    document.addEventListener(EVENT.MOUSE_MOVE, whileDragging);
    document.addEventListener(EVENT.MOUSE_UP, stopDragging);
  }

  function whileDragging(event) {
    // we _always_ want to change the module's coordinates
    // while dragging, whether in isEditing mode or not:
    coords.x = dragObj.startX + event.clientX - dragObj.cursorStartX;
    coords.y = dragObj.startY + event.clientY - dragObj.cursorStartY;

    if (!store.isEditing) {
      whileSorting(coords);
    }
  }

  function stopDragging() {
    isDragging.value = false;

    if (store.isEditing) {
      // update the store with new coordinates
      store.updateGridPosition(coords); // x, y, id
    } else {
      // restore the x,y GRID coordinates -- we don't want the module
      // to have moved around when we switch out of play mode
      coords.x = dragObj.x;
      coords.y = dragObj.y;
      stopSorting();
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
