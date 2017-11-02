/**
 * NOTE: "modules" (nee items) are from the App's internal data state.
 * They are synchronized with the vuex store via a getter. But to be
 * clear, we can destructively mess with this data array and not worry
 * too much as the source of truth is still safe within vuex.
 *
 * NOTE: As this is a mixin, several object properties are defined
 * elsewhere but referenced here. The two primary ones are:
 *   this.active
 *   this.modules

 */
const lanes = 3;

import GridList from '../assets/vendor/gridList';
import { rackWidth, rackHeight } from '../dimensions';

export const sortable = {
  methods: {
    initSorting(handle) {
      this.handle = handle;
      this.$positionHighlight = this.handle.querySelector('.position-highlight');
      this.$positionHighlight.style.display = 'none';

      this.setupGrid();
    },

    setupGrid() {
      this._widestItem = Math.max.apply(null, this.modules.map(function(item) { return item.w; }));
      this._tallestItem = Math.max.apply(null, this.modules.map(function(item) { return item.h; }));
      this.gridList = new GridList(this.modules);
      this._applyPositionToItems();

      console.log('%c Setting up sortable ', 'background:#666;color:white;font-weight:bold;');
      console.log('%c' + this.gridList.toString(), 'font-family:monospace;font-size:10px');
    },

    startSorting() {
      // Since dragging actually alters the grid, we need to establish the number
      // of cols (+1 extra) before the drag starts
      this._maxGridCols = this.gridList.grid.length;
    },

    whileSorting(el) {
      // WE need two things, here:
      //   - "item": which has row, col coords
      //   - "el": HTMLElement which we'll use to determine the module's actual position in the grid
      var item = this.active; // NOTE: active is available via App.vue in a vuex getter
      var newPosition = this._snapItemPositionToGrid(el, item);

      if (this._dragPositionChanged(newPosition)) {
        this._previousDragPosition = newPosition;
        this.gridList.generateGrid();
        this.gridList.moveItemToPosition(item, newPosition);

        // Visually update item positions and highlight shape
        this._applyPositionToItems();
        this._highlightPositionForItem(item);
      }
    },

    stopSorting() {
      // this._triggerOnChange()
      this._previousDragPosition = null;
      this._applyPositionToItems();
      this._removePositionHighlight();

      console.log('%c' + this.gridList.toString(), 'font-family:monospace;font-size:10px');
    },

    // -----------------------------------------------------------------

    _getItemWidth(item) {
      return item.w * rackWidth;
    },

    _getItemHeight(item) {
      return item.h * rackHeight;
    },

    _applyPositionToItems() {
      this.modules.forEach((item) => {
        // Don't interfere with the position of the dragged items. TODO - is this the case...?
        if (this.active !== item) {
          this.$store.commit('UPDATE_RACK_POSITION', {
            id: item.id,
            col: item.col,
            row: item.row
          });
        }
      });

      this.handle.style.width = (this.gridList.grid.length + this._widestItem) * rackWidth;
    },


    // -----------------------------------------------------------------


    _dragPositionChanged(newPosition) {
      if (!this._previousDragPosition) {
        return true;
      }
      return newPosition[0] !== this._previousDragPosition[0] ||
             newPosition[1] !== this._previousDragPosition[1];
    },

    _snapItemPositionToGrid(el, item) {
      // var position = el.getBoundingClientRect();
      var position = {
        left: el.offsetLeft,
        top: el.offsetTop
      };

      var col = Math.round(position.left / rackWidth);
      var row = Math.round(position.top / rackHeight);

      // Keep item position within the grid and don't
      // let the item create more than one extra column
      col = Math.max(col, 0);
      row = Math.max(row, 0);

      col = Math.min(col, this._maxGridCols);
      row = Math.min(row, lanes - item.h);

      return [col, row];
    },

    _highlightPositionForItem(item) {
      this.$positionHighlight.style.width = this._getItemWidth(item) + 'px';
      this.$positionHighlight.style.height = this._getItemHeight(item) + 'px';
      this.$positionHighlight.style.left = item.col * rackWidth + 'px';
      this.$positionHighlight.style.top = item.row * rackHeight + 'px';
      this.$positionHighlight.style.display = 'block';
    },

    _removePositionHighlight() {
      this.$positionHighlight.style.display = 'none';
    }

    // _triggerOnChange() {
    //   if (typeof options.onChange !== 'function') {
    //     return;
    //   }
    //   options.onChange.call(
    //     this, this.gridList.getChangedItems(this._items, '$element'));
    // }
  }
};
