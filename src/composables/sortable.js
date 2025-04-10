// import { computed } from 'vue';
import GridList from '@/utils/gridList';
import { useAppStore } from '@/stores/app';
import { rackWidth, rackHeight } from '@/constants';


const LANES = 3;

let handle;
// let items = [];
let gridlist;
let positionHighlight;

export function useSortable() {
  let maxGridCols;
  let widestItem;
  let tallestItem;
  let previousDragPosition;
  const store = useAppStore();
  // const activeModule = computed(() => store.activeModule);

  function initSorting(container, items = []/* modules */) {
    handle = container;
    // items = modules;
    gridlist = new GridList(items);

    positionHighlight = handle.querySelector('#position-outline');
    positionHighlight.style.display = 'none';

    resetItems(items);
  }

  function resetItems(items) {
    gridlist.items = items;
    if (items.length) {
      resetSorting();
    }
  }

  function resetItem(item) {
    gridlist.moveItemToPosition(item, [0, 0]);
  }

  function resetSorting() {
    widestItem = Math.max.apply(null, gridlist.items.map((item) => item.w));
    tallestItem = Math.max.apply(null, gridlist.items.map((item) => item.h));
    applyPositionToItems();
  }

  function startSorting() {
    // Since dragging actually alters the grid, we need to establish the number
    // of cols (+1 extra) before the drag starts
    maxGridCols = gridlist.grid.length;
  }

  function whileSorting(coords) {
    const newPosition = snapItemPositionToGrid(coords);

    if (dragPositionChanged(newPosition)) {
      previousDragPosition = newPosition;
      gridlist.generateGrid();
      gridlist.moveItemToPosition(store.activeModule, newPosition);

      // Visually update item positions and highlight shape
      applyPositionToItems();
      highlightPositionForItem(store.activeModule);
    }
  }

  function stopSorting() {
    // this._triggerOnChange()
    previousDragPosition = null;
    applyPositionToItems();
    removePositionHighlight();

    console.log('%c' + gridlist.toString(), 'font-family:monospace;font-size:10px');
  }

  // -----------------------------------------------------------------


  function getItemWidth(item) {
    return item.w * rackWidth;
  }

  function getItemHeight(item) {
    return item.h * rackHeight;
  }

  function applyPositionToItems() {
    gridlist.items.forEach((item) => {
      // Don't interfere with the position of the dragged items. TODO - is this the case...?
      if (store.activeModule !== item) {
        // store.commit('UPDATE_RACK_POSITION', {
        store.updateRackPosition({
          id: item.id,
          col: item.col,
          row: item.row
        });
      }
    });

    handle.style.width = (gridlist.grid.length + widestItem) * rackWidth;

    tallestItem++;  // so that linter doesn't complain of unused variable
  }


  // -----------------------------------------------------------------


  function dragPositionChanged(newPosition) {
    if (!previousDragPosition) {
      return true;
    }
    return newPosition[0] !== previousDragPosition[0] ||
            newPosition[1] !== previousDragPosition[1];
  }

  function snapItemPositionToGrid(position) {

    // var position = {
    //   x: el.offsetLeft,
    //   y: el.offsetTop
    // };
    const item = store.activeModule;
    let col = Math.round(position.x / rackWidth);
    let row = Math.round(position.y / rackHeight);

    // Keep item position within the grid and don't
    // let the item create more than one extra column
    col = Math.max(col, 0);
    row = Math.max(row, 0);

    col = Math.min(col, maxGridCols);
    row = Math.min(row, LANES - item.h);

    return [col, row];
  }

  function highlightPositionForItem(item) {
    positionHighlight.style.width = getItemWidth(item) + 'px';
    positionHighlight.style.height = getItemHeight(item) + 'px';
    positionHighlight.style.left = item.col * rackWidth + 'px';
    positionHighlight.style.top = item.row * rackHeight + 'px';
    positionHighlight.style.display = 'block';
  }

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
    resetItems,
    resetItem,
  }
}
