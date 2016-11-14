/**
 * NOTE: "modules" (nee items) are from the App's internal data state.
 * They are synchronized with the vuex store via a getter. But to be
 * clear, we can destructively mess with this data array and not worry
 * too much as the source of truth is still safe within vuex.
 */

import GridList from '../../static/js/gridList';  // TODO more this. move static
import { updateRackPosition } from '../store/actions';
import { rackWidth, rackHeight } from '../dimensions';

import store from '../store/store'; // .... er...

const lanes = 3;


export const sortable = {
  vuex: {
    actions: {
      updateRackPosition
    }
  },

  methods: {
    initSorting(handle) {
      this.handle = handle;
      this._widestItem = Math.max.apply(null, this.modules.map(function(item) { return item.w; }));
      this._tallestItem = Math.max.apply(null, this.modules.map(function(item) { return item.h; }));

      // Used to highlight a position an element will land on upon drop
      this.$positionHighlight = this.handle.querySelector('.position-highlight');
      this.$positionHighlight.style.display = 'none';

      // this._initGridList();
      this.gridList = new GridList(this.modules);
      this.reflow();
    },

    reflow() {
      this._calculateCellSize();
      this.render();
    },

    render() {
      // this._applySizeToItems();
      this._applyPositionToItems();
    },

    startSorting() {
      // Since dragging actually alters the grid, we need to establish the number
      // of cols (+1 extra) before the drag starts
      this._maxGridCols = this.gridList.grid.length;

      // see line 80:
      // A)
      this.item = store.state.modules.find(function(m) {
        return m.id === store.state.active;
      });

      // B)
      // this.item = this.$store.state.modules.find(function(m) {
      //   return m.id === this.$store.state.activeModule;
      // });

      // C)
      // this.item = this.$store.getters.active;
    },

    // _onDrag
    whileSorting(el) {
      // WE need two things, here:
      //   - the "item" object, which has row,col coords
      //   - the HTMLElement, $el, which we'll use to determine "item"s actual position in the grid
      //
      // TODO why not get this on startSort... and stash above?
      var item = this.item;
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

    // _onStop
    stopSorting() {
      // this._triggerOnChange()
      this.item = null;             // [wes] added by me
      this._previousDragPosition = null;
      this._applyPositionToItems();
      this._removePositionHighlight();
      // console.log(this.gridList.toString());
    },

    _calculateCellSize() {
      this._rackHeight = rackHeight;
      this._rackWidth = rackWidth;
    },


    // -----------------------------------------------------------------


    _getItemWidth(item) {
      return item.w * this._rackWidth;
    },

    _getItemHeight(item) {
      return item.h * this._rackHeight;
    },

    _applyPositionToItems() {
      this.modules.forEach((item) => {
        // Don't interfere with the positions of the dragged items
        if (this.item !== item) {
          this.updateRackPosition(item.id, item.col, item.row);
        }
      });

      // Update the width of the entire grid container with enough room on the
      // right to allow dragging items to the end of the grid.
      // if (this.options.direction === 'horizontal') {
      this.handle.style.width = (this.gridList.grid.length + this._widestItem) * this._rackWidth;
      // } else {
        // this.handle.style.height = (this.gridList.grid.length + this._tallestItem) * this._rackHeight;
      // }
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

      var col = Math.round(position.left / this._rackWidth);
      var row = Math.round(position.top / this._rackHeight);

      // Keep item position within the grid and don't let the item create more
      // than one extra column
      col = Math.max(col, 0);
      row = Math.max(row, 0);

      // if (this.options.direction === 'horizontal') {
      col = Math.min(col, this._maxGridCols);
      row = Math.min(row, lanes - item.h);
      // } else {
      //   col = Math.min(col, this.options.lanes - item.w);
      //   row = Math.min(row, this._maxGridCols);
      // }

      return [col, row];
    },

    _highlightPositionForItem(item) {
      this.$positionHighlight.style.width = this._getItemWidth(item) + 'px';
      this.$positionHighlight.style.height = this._getItemHeight(item) + 'px';
      this.$positionHighlight.style.left = item.col * this._rackWidth + 'px';
      this.$positionHighlight.style.top = item.row * this._rackHeight + 'px';
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
