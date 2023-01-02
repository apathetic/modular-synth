/**
 * NOTE: "items" (nee items) are from the App's internal data state.
 * They are synchronized with the vuex store via a getter. But to be
 * clear, we can destructively mess with this data array and not worry
 * too much as the source of truth is still safe within vuex.
 *
 * NOTE: As this is a mixin, several object properties are defined
 * elsewhere but referenced here. The two primary ones are:
 *   this.activeModule
 *   modules
 */

// const initialized = false;
import { computed } from 'vue';
// import { computed } from "@vue/composition-api";

import GridList from '@/utils/gridList';
// import { createStore } from '@/store';
import { useAppStore as createStore } from '@/stores/app';
import { rackWidth, rackHeight } from '@/constants';


const LANES = 3;

let handle;
let items = [];
let gridlist;
let positionHighlight;

export function useSortable() {
  let maxGridCols;
  let widestItem;
  let tallestItem;
  let previousDragPosition;
  const store = createStore();
  const activeModule = computed(() => store.getters['activeModule']);

  function initSorting(modules, container) {
    items = modules;
    handle = container;
    gridlist = new GridList(items);

    positionHighlight = handle.querySelector('.position-highlight');
    positionHighlight.style.display = 'none';

    resetSorting();
  };

  function resetSorting() {
    if (items && items.length) {
      widestItem = Math.max.apply(null, items.map((item) => item.w ));
      tallestItem = Math.max.apply(null, items.map((item) => item.h ));
      // gridlist = new GridList(items);
      applyPositionToItems();
    }
  };

  function startSorting() {
    // Since dragging actually alters the grid, we need to establish the number
    // of cols (+1 extra) before the drag starts
    maxGridCols = gridlist.grid.length;
  };

  function whileSorting(coords) {
    const newPosition = snapItemPositionToGrid(coords);

    if (dragPositionChanged(newPosition)) {
      previousDragPosition = newPosition;
      gridlist.generateGrid();
      gridlist.moveItemToPosition(activeModule.value, newPosition);

      // Visually update item positions and highlight shape
      applyPositionToItems();
      highlightPositionForItem(activeModule.value);
    }
  };

  function stopSorting() {
    // this._triggerOnChange()
    previousDragPosition = null;
    applyPositionToItems();
    removePositionHighlight();

    console.log('%c' + gridlist.toString(), 'font-family:monospace;font-size:10px');
  };

  // -----------------------------------------------------------------


  function getItemWidth(item) {
    return item.w * rackWidth;
  };

  function getItemHeight(item) {
    return item.h * rackHeight;
  };

  function applyPositionToItems() {
    items.forEach((item) => {
      // Don't interfere with the position of the dragged items. TODO - is this the case...?
      if (activeModule.value !== item) {
        store.commit('UPDATE_RACK_POSITION', {
          id: item.id,
          col: item.col,
          row: item.row
        });
      }
    });

    handle.style.width = (gridlist.grid.length + widestItem) * rackWidth;
  };


  // -----------------------------------------------------------------


  function dragPositionChanged(newPosition) {
    if (!previousDragPosition) {
      return true;
    }
    return newPosition[0] !== previousDragPosition[0] ||
            newPosition[1] !== previousDragPosition[1];
  };

  function snapItemPositionToGrid(position) {

    // var position = {
    //   x: el.offsetLeft,
    //   y: el.offsetTop
    // };
    const item = activeModule.value;
    let col = Math.round(position.x / rackWidth);
    let row = Math.round(position.y / rackHeight);

    // Keep item position within the grid and don't
    // let the item create more than one extra column
    col = Math.max(col, 0);
    row = Math.max(row, 0);

    col = Math.min(col, maxGridCols);
    row = Math.min(row, LANES - item.h);

    return [col, row];
  };

  function highlightPositionForItem(item) {
    positionHighlight.style.width = getItemWidth(item) + 'px';
    positionHighlight.style.height = getItemHeight(item) + 'px';
    positionHighlight.style.left = item.col * rackWidth + 'px';
    positionHighlight.style.top = item.row * rackHeight + 'px';
    positionHighlight.style.display = 'block';
  };

  function removePositionHighlight() {
    positionHighlight.style.display = 'none';
  }

  // _triggerOnChange() {
  //   if (typeof options.onChange !== 'function') {
  //     return;
  //   }
  //   options.onChange.call(
  //     this, gridlist.getChangedItems(this._items, '$element'));
  // }


  return {
    initSorting,
    startSorting,
    whileSorting,
    stopSorting,
    resetSorting,
  }
};
