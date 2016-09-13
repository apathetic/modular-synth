import GridList from '../../static/js/gridList';  // TODO more this. move static
import store from '../vuex/store'; // .... er...

const rowHeight = 240;

export const sortable = {
  // vuex: {
  //   getters: {
  //     active: state => state.activeModule    // state.selected...???
  //   }
  // },

  data() {
    return {
      // items: [
      //   {w: 1, h: 1, col: 0, row: 0, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 2, col: 0, row: 1, width: '', height: '', left: '', top: ''},
      //   {w: 2, h: 2, col: 1, row: 0, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 1, col: 1, row: 2, width: '', height: '', left: '', top: ''},
      //   {w: 2, h: 1, col: 2, row: 2, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 1, col: 3, row: 0, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 1, col: 3, row: 1, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 0, col: 4, row: 0, width: '', height: '', left: '', top: ''},
      //   {w: 3, h: 1, col: 5, row: 0, width: '', height: '', left: '', top: ''},
      //   {w: 2, h: 1, col: 5, row: 1, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 1, col: 5, row: 2, width: '', height: '', left: '', top: ''},
      //   {w: 2, h: 1, col: 6, row: 2, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 1, col: 7, row: 1, width: '', height: '', left: '', top: ''},
      //   {w: 2, h: 0, col: 8, row: 0, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 1, col: 10, row: 0, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 1, col: 10, row: 1, width: '', height: '', left: '', top: ''},
      //   {w: 1, h: 1, col: 10, row: 2, width: '', height: '', left: '', top: ''}
      // ],

      options: {
        lanes: 3,
        direction: 'horizontal',
        itemSelector: '.module',
        widthHeightRatio: 1,
        dragAndDrop: true
      }

      // draggableOptions: {
      //   zIndex: 2,
      //   scroll: false,
      //   containment: 'parent'
      // }
    };
  },

  ready() {
    // this.handle = this.$els.grid;
    // this._init();
    // this._bindEvents();

    // window.addEventListener('resize', function() {
    //   this.gridList.resizeGrid(this.options.lanes);   // mmm, this is unbound, here. () => prolly wont work neither
    // }.bind(this));
  },

  methods: {
    resize(lanes) {
      if (lanes) {
        this.options.lanes = lanes;
      }

      this._createGridSnapshot();
      this.gridList.resizeGrid(this.options.lanes);
      this._updateGridSnapshot();

      this.reflow();
    },

    reflow() {
      this._calculateCellSize();
      this.render();
    },

    render() {
      this._applySizeToItems();
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

      this._initGridList();
      this.reflow();

      // if (this.options.dragAndDrop) {
        // Init Draggable JQuery UI plugin for each of the list items
        // http://api.jqueryui.com/draggable/
        // this.elements.draggable(this.draggableOptions);
      // }
    },

    _initGridList() {
      // Create instance of GridList (decoupled lib for handling the grid
      // positioning and sorting post-drag and dropping)
      this.gridList = new GridList(this.items, {
        lanes: this.options.lanes,
        direction: this.options.direction
      });
    },

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
      // see line 193:
      this.item = store.state.modules.find(function(m) {
        return m.id === store.state.activeModule;
      });
    },

    // _onDrag
    whileSorting(el) {
      // WE need two things, here:
      //   - the "item" object, which we'll store updated row,col coords on
      //   - the HTMLElement, $el, which we'll use to determine "item"s position in the grid
      //
      // TODO why not get this on startSort... and stash above?
      var item = this.item;
      // var item = this._getItemByElement(ui.helper);    // jquery UI draggable thing. HTMLElement.

      var newPosition = this._snapItemPositionToGrid(el, item);

      if (this._dragPositionChanged(newPosition)) {
        this._previousDragPosition = newPosition;

        // Regenerate the grid with the positions from when the drag started
        //
        //
        // GridList.cloneItems(this._items, this.items);
        // this.items = Object.assign({}, this._items);
        this.items = Object.keys(this._items).map(key => this._items[key]);
        //
        //

        this.gridList.generateGrid();

        // Since the items list is a deep copy, we need to fetch the item
        // corresponding to this drag action again
        // item = this._getItemByElement(ui.helper);  // [wes] ..again?
        this.gridList.moveItemToPosition(item, newPosition);

        // Visually update item positions and highlight shape
        this._applyPositionToItems();
        this._highlightPositionForItem(item);
      }
    },

    // _onStop
    stopSorting(event) {
      this._updateGridSnapshot();
      this._previousDragPosition = null;

      // HACK: jQuery.draggable removes this class after the dragstop callback,
      // and we need it removed before the drop, to re-enable CSS transitions
      // $(ui.helper).removeClass('ui-draggable-dragging');
      document.querySelector('ui.helper').classList.remove('ui-draggable-dragging');


      this._applyPositionToItems();
      this._removePositionHighlight();
    },

    // _generateItemsFromDOM() {
    //   /**
    //    * Generate the structure of items used by the GridList lib, using the DOM
    //    * data of the children of the targeted element. The items will have an
    //    * additional reference to the initial DOM element attached, in order to
    //    * trace back to it and re-render it once its properties are changed by the
    //    * GridList lib
    //    */
    //   // var _this = this;
    //   var items = [];
    //   // var item;
    //
    //   // this.elements.each(function(i, element) {
    //   Array.from(this.elements, function(element) {
    //     items.push({
    //       $element: element,
    //       x: Number(element.getAttribute('data-x')),
    //       y: Number(element.getAttribute('data-y')),
    //       w: Number(element.getAttribute('data-w')),
    //       h: Number(element.getAttribute('data-h')),
    //       id: Number(element.getAttribute('data-id'))
    //     });
    //   });
    //   return items;
    // },
    //
    // _getItemByElement(element) {
    //   // XXX: this could be optimized by storing the item reference inside the
    //   // meta data of the DOM element
    //   // for (var i = 0; i < this.items.length; i++) {
    //   //   if (this.items[i].$element.is(element)) {
    //   //     return this.items[i];
    //   //   }
    //   // }
    //
    //   return this.items.find((item) => {
    //     // TODO: i think only components have $el.  How to reference each item's HTMLElement in the template
    //     item.$el === element;
    //   });
    // },

    _calculateCellSize() {
      this._cellHeight = rowHeight;
      this._cellWidth = this._cellHeight * this.options.widthHeightRatio;

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

    _applySizeToItems() {
      this.items.forEach((item) => {
        item.width = this._getItemWidth(item);
        item.height = this._getItemHeight(item);
      });
    },

    _applyPositionToItems() {
      console.log(this.items);

      this.items.forEach((item) => {
        // Don't interfere with the positions of the dragged items
        if (!item.move) {
          item.left = item.col * this._cellWidth;
          item.top = item.row * this._cellHeight;
        }
      });

      // Update the width of the entire grid container with enough room on the
      // right to allow dragging items to the end of the grid.
      if (this.options.direction === 'horizontal') {
        this.handle.style.width = (this.gridList.grid.length + this._widestItem) * this._cellWidth;
      } else {
        this.handle.style.height = (this.gridList.grid.length + this._tallestItem) * this._cellHeight;
      }
    },


    // -----------------------------------------------------------------


    _dragPositionChanged(newPosition) {
      if (!this._previousDragPosition) {
        return true;
      }
      return (newPosition[0] !== this._previousDragPosition[0] ||
              newPosition[1] !== this._previousDragPosition[1]);
    },

    _snapItemPositionToGrid(el, item) {
      // var position = item.$element.position();
      // position[0] -= this.$element.position().left; // [wes] ???????
      var position = el.getBoundingClientRect();

      var col = Math.round(position.left / this._cellWidth);
      var row = Math.round(position.top / this._cellHeight);

      // Keep item position within the grid and don't let the item create more
      // than one extra column
      col = Math.max(col, 0);
      row = Math.max(row, 0);

      // if (this.options.direction === 'horizontal') {
      col = Math.min(col, this._maxGridCols);
      row = Math.min(row, this.options.lanes - item.h);
      // } else {
      //   col = Math.min(col, this.options.lanes - item.w);
      //   row = Math.min(row, this._maxGridCols);
      // }

      return [col, row];
    },

    _highlightPositionForItem(item) {
      // this.$positionHighlight.css({
      this.$positionHighlight.style.width = this._getItemWidth(item);
      this.$positionHighlight.style.height = this._getItemHeight(item);
      this.$positionHighlight.style.left = item.col * this._cellWidth;
      this.$positionHighlight.style.top = item.row * this._cellHeight;

      this.$positionHighlight.style.display = 'block';
      // });
      // }).show();
      // if (this.options.heightToFontSizeRatio) {
      //   this.$positionHighlight.css('font-size', this._fontSize);
      // }
    },

    _removePositionHighlight() {
      this.$positionHighlight.hide();
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
      this._triggerOnChange();

      //
      //
      // GridList.cloneItems(this.items, this._items);
      // this._items = Object.assign({}, this.items);
      this._items = Object.keys(this.items).map(key => this.items[key]);
      //
      //
    },

    _triggerOnChange() {
      if (typeof this.options.onChange !== 'function') {
        return;
      }
      this.options.onChange.call(
        this, this.gridList.getChangedItems(this._items, '$element'));
    }
  }
};
