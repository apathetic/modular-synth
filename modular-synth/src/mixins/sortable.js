import GridList from '../../static/js/gridList';  // TODO more this. move static
import { updateGridLocation } from '../vuex/actions';
import store from '../vuex/store'; // .... er...

const rowHeight = 240;
// const colWidth = 120;
const options = {
  lanes: 3,
  widthHeightRatio: 1 // 0.5
};


export const sortable = {
  vuex: {
    actions: {
      updateGridLocation
    }
    //   getters: {
    //     active: state => state.activeModule    // state.selected...???
    //   }
  },

  // data() {
  //   return {
  //     options: {
  //       lanes: 3,
  //       widthHeightRatio: 1
  //     }
  //   };
  // },

  // ready() {
  //   this.handle = this.$els.grid;
  //   this._init();
  //   this._bindEvents();
  //
  //   window.addEventListener('resize', function() {
  //     this.gridList.resizeGrid(this.options.lanes);   // mmm, this is unbound, here. () => prolly wont work neither
  //   }.bind(this));
  // },

  //
  //
  //
  //
  // TODO I think we can safely kill all _createGridSnapshot() refs -- there is no
  //      need to clone the items on each sort; they're safe within the store (and
  //      any actions on them are not desctructive by design).
  //

  methods: {
    // resize(lanes) {
    //   if (lanes) {
    //     options.lanes = lanes;
    //   }
    //
    //   this._createGridSnapshot();
    //   this.gridList.resizeGrid(options.lanes);
    //   this._updateGridSnapshot();
    //
    //   this.reflow();
    // },

    reflow() {
      this._calculateCellSize();
      this.render();
    },

    render() {
      // this._applySizeToItems();
      this._applyPositionToItems();
    },

    // _bindMethod(fn) {
    //   /**
    //    * Bind prototype method to instance scope (similar to CoffeeScript's fat
    //    * arrow)
    //    */
    //   var that = this;
    //   return function() {
    //     return fn.apply(that, arguments);
    //   };
    // },

    _init() {
      // TODO TODO TODO how to get the $el from the child components?
      // this.elements = this.handle.children(this.options.itemSelector);
      // this.elements = this.handle.querySelectorAll(this.options.itemSelector);


      this._widestItem = Math.max.apply(null, this.items.map(function(item) { return item.w; }));
      this._tallestItem = Math.max.apply(null, this.items.map(function(item) { return item.h; }));

      // Used to highlight a position an element will land on upon drop
      this.$positionHighlight = this.handle.querySelector('.position-highlight');
      this.$positionHighlight.style.display = 'none';

      // this._initGridList();
      this.gridList = new GridList(this.items, {
        lanes: options.lanes
      });

      this.reflow();

      // if (this.options.dragAndDrop) {
        // Init Draggable JQuery UI plugin for each of the list items
        // http://api.jqueryui.com/draggable/
        // this.elements.draggable(this.draggableOptions);
      // }
    },

    // _initGridList() {
    //   // Create instance of GridList (decoupled lib for handling the grid
    //   // positioning and sorting post-drag and dropping)
    //   this.gridList = new GridList(this.items, {
    //     lanes: this.options.lanes
    //     // direction: this.options.direction
    //   });
    // },

    // _bindEvents() {
    //   // this._onStart = this._bindMethod(this.startSorting);
    //   // this._onDrag = this._bindMethod(this.whileSorting);
    //   // this._onStop = this._bindMethod(this.stopSorting);
    //
    //   // this.elements.on('dragstart', this.startSorting);
    //   // this.elements.on('drag', this.whileSorting);
    //   // this.elements.on('dragstop', this.stopSorting);

    //   Array.from(this.elements, (item) => {
    //     item.addEventListener('dragstart', this.startSorting);
    //     item.addEventListener('drag', this.whileSorting);
    //     item.addEventListener('dragstop', this.stopSorting);
    //   });
    // },

    // _unbindEvents() {
    //   this.elements.off('dragstart', this._onStart);
    //   this.elements.off('drag', this.whileSorting);
    //   this.elements.off('dragstop', this.stopSorting);
    // }

    // _onStart
    startSorting() {
      // Create a deep copy of the items; we use them to revert the item
      // positions after each drag change, making an entire drag operation less
      // destructable
      this._createGridSnapshot();

      // Since dragging actually alters the grid, we need to establish the number
      // of cols (+1 extra) before the drag starts
      this._maxGridCols = this.gridList.grid.length;

      //
      // see line 157:
      this.item = store.state.modules.find(function(m) {
        return m.id === store.state.activeModule;
      });
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

        // Regenerate the grid with the positions from when the drag started
        // GridList.cloneItems(this._items, this.items);
        // this.items = Object.assign({}, this._items);
        this.items = Object.keys(this._items).map(key => this._items[key]);        // TODO kill this?

        this.gridList.generateGrid();

        // Since the items list is a deep copy, we need to fetch the item
        // corresponding to this drag action again
        // item = this._getItemByElement(ui.helper);  // [wes] what? why? no.
        this.gridList.moveItemToPosition(item, newPosition);

        // Visually update item positions and highlight shape
        this._applyPositionToItems();
        this._highlightPositionForItem(item);
      }
    },

    // _onStop
    stopSorting() {
      this._updateGridSnapshot();   // TODO kill this?
      // this.item.move = false;    // [wes] added by me
      this.item = null;             // [wes] added by me
      this._previousDragPosition = null;
      this._applyPositionToItems();
      this._removePositionHighlight();

      console.log(this.gridList.toString());
    },

    _calculateCellSize() {
      this._cellHeight = rowHeight;
      this._cellWidth = this._cellHeight * options.widthHeightRatio;

      // if (this.options.direction === 'horizontal') {
      //   this._cellHeight = Math.floor(this.handle.offsetHeight / this.options.lanes);
      //   this._cellWidth = this._cellHeight * this.options.widthHeightRatio;
      // } else {
      //   this._cellWidth = Math.floor(this.$element.width() / this.options.lanes);
      //   this._cellHeight = this._cellWidth / this.options.widthHeightRatio;
      // }
      // if (this.options.heightToFontSizeRatio) {
      //   this._fontSize = this._cellHeight * this.options.heightToFontSizeRatio;
      // }
    },


    // -----------------------------------------------------------------


    _getItemWidth(item) {
      return item.w * this._cellWidth;
    },

    _getItemHeight(item) {
      return item.h * this._cellHeight;
    },

    // _applySizeToItems() {
    //   this.items.forEach((item) => {
    //     item.width = this._getItemWidth(item);
    //     item.height = this._getItemHeight(item);
    //   });
    // },

    _applyPositionToItems() {
      this.items.forEach((item) => {
        // Don't interfere with the positions of the dragged items
        // if (!item.move) {
        if (this.item !== item) {
          // item.left = item.col * this._cellWidth;
          // item.top = item.row * this._cellHeight;

          // const x = item.col * this._cellWidth;
          // const y = item.row * this._cellHeight;
          // this.updatePosition(item.id, x, y);

          // NOTE: we do not want to manually set or override x,y here.
          //
          // Rather, lets simply set col,row in the store and let the data figure itself out:
          this.updateGridLocation(item.id, item.col, item.row);
          //
          //
        }
      });

      // Update the width of the entire grid container with enough room on the
      // right to allow dragging items to the end of the grid.
      // if (this.options.direction === 'horizontal') {
      this.handle.style.width = (this.gridList.grid.length + this._widestItem) * this._cellWidth;
      // } else {
        // this.handle.style.height = (this.gridList.grid.length + this._tallestItem) * this._cellHeight;
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
      // var position = item.$element.position();
      // position[0] -= this.$element.position().left; // [wes]: ???????

      // var position = el.getBoundingClientRect();
      var position = {
        left: el.offsetLeft,
        top: el.offsetTop
      };

      var col = Math.round(position.left / this._cellWidth);
      var row = Math.round(position.top / this._cellHeight);

      // Keep item position within the grid and don't let the item create more
      // than one extra column
      col = Math.max(col, 0);
      row = Math.max(row, 0);

      // if (this.options.direction === 'horizontal') {
      col = Math.min(col, this._maxGridCols);
      row = Math.min(row, options.lanes - item.h);
      // } else {
      //   col = Math.min(col, this.options.lanes - item.w);
      //   row = Math.min(row, this._maxGridCols);
      // }

      return [col, row];
    },

    _highlightPositionForItem(item) {
      this.$positionHighlight.style.width = this._getItemWidth(item) + 'px';
      this.$positionHighlight.style.height = this._getItemHeight(item) + 'px';
      this.$positionHighlight.style.left = item.col * this._cellWidth + 'px';
      this.$positionHighlight.style.top = item.row * this._cellHeight + 'px';
      this.$positionHighlight.style.display = 'block';
    },

    _removePositionHighlight() {
      this.$positionHighlight.style.display = 'none';
    },

    _createGridSnapshot() {
      //
      //
      // this._items = GridList.cloneItems(this.items);
      // this._items = Object.assign({}, this.items);  // this clones items in the vuex store...???
      this._items = Object.keys(this.items).map(key => this.items[key]);
      //
      //
    },

    _updateGridSnapshot() {
      // Notify the user with the items that changed since the previous snapshot
      // this._triggerOnChange();

      // GridList.cloneItems(this.items, this._items);
      // this._items = Object.assign({}, this.items);
      this._items = Object.keys(this.items).map(key => this.items[key]);
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
