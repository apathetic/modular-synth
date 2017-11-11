import GridList from './GridList';

const defaults = {
  lanes: 5,
  direction: 'horizontal',
  itemSelector: 'li[data-w]',
  widthHeightRatio: 1,
  dragAndDrop: true
};

const draggableDefaults = {
  zIndex: 2,
  scroll: false,
  containment: 'parent'
};

export default class DraggableGridList {
// class DraggableGridList {

  constructor(element, options, draggableOptions) {
    this.options = Object.assign({}, defaults, options);
    this.draggableOptions = Object.assign({}, draggableDefaults, draggableOptions);

    // this.$element = $(element);
    this.element = typeof element === 'string'
                   ? document.querySelector(element)
                   : element;

    this._init();
    this._bindEvents();
  }


  // destroy: function() {
  //   this._unbindEvents();
  // },

  resize(lanes) {
    if (lanes) {
      this.options.lanes = lanes;
    }
    this._createGridSnapshot();
    this.gridList.resizeGrid(this.options.lanes);
    this._updateGridSnapshot();

    this.reflow();
  }

  resizeItem(element, size) {
    /**
     * Resize an item.
     *
     * @param {Object} size
     * @param {Number} [size.w]
     * @param {Number} [size.h}
     */

    this._createGridSnapshot();
    this.gridList.resizeItem(this._getItemByElement(element), size);
    this._updateGridSnapshot();

    this.render();
  }

  reflow() {
    this._calculateCellSize();
    this.render();
  }

  render() {
    this._applySizeToItems();
    this._applyPositionToItems();
  }

  _bindMethod(fn) {
    /**
     * Bind prototype method to instance scope (similar to CoffeeScript's fat
     * arrow)
     */
    var that = this;
    return function() {
      return fn.apply(that, arguments);
    };
  }

  _init() {
    // Read items and their meta data. Ignore other list elements (like the
    // position highlight)
    // this.$items = this.element.children(this.options.itemSelector);
    this.$items = this.element.querySelectorAll(this.options.itemSelector);
    this.items = this._generateItemsFromDOM();
    this._widestItem = Math.max.apply(null, this.items.map(function(item) { return item.w; }));
    this._tallestItem = Math.max.apply(null, this.items.map(function(item) { return item.h; }));

    // Used to highlight a position an element will land on upon drop
    this.$positionHighlight = this.element.querySelectorAll('.position-highlight'); // .hide();
    Array.from(this.$positionHighlight, (el) => { el.style.display = 'none'; });

    this._initGridList();
    this.reflow();

    if (this.options.dragAndDrop) {



      // Init Draggable JQuery UI plugin for each of the list items
      // http://api.jqueryui.com/draggable/
      // this.$items.draggable(this.draggableOptions);



    }
  }

  _initGridList() {
    // Create instance of GridList (decoupled lib for handling the grid
    // positioning and sorting post-drag and dropping)
    this.gridList = new GridList(this.items, {
      lanes: this.options.lanes,
      direction: this.options.direction
    });
  }

  _bindEvents() {
    this._onStart = this._bindMethod(this._onStart);
    this._onDrag = this._bindMethod(this._onDrag);
    this._onStop = this._bindMethod(this._onStop);

    // this.$items.on('dragstart', this._onStart);
    // this.$items.on('drag', this._onDrag);
    // this.$items.on('dragstop', this._onStop);
    Array.from(this.$items, (item) => {
      item.addEventListener('dragstart', this._onStart);
      item.addEventListener('drag', this._onDrag);
      item.addEventListener('dragstop', this._onStop);
    });
  }

  // _unbindEvents() {
  //   this.$items.off('dragstart', this._onStart);
  //   this.$items.off('drag', this._onDrag);
  //   this.$items.off('dragstop', this._onStop);
  // }

  _onStart(event, ui) {
    // Create a deep copy of the items; we use them to revert the item
    // positions after each drag change, making an entire drag operation less
    // distructable
    this._createGridSnapshot();

    // Since dragging actually alters the grid, we need to establish the number
    // of cols (+1 extra) before the drag starts

    this._maxGridCols = this.gridList.grid.length;
  }

  _onDrag(event, ui) {
    var item = this._getItemByElement(ui.helper);
    var newPosition = this._snapItemPositionToGrid(item);

    if (this._dragPositionChanged(newPosition)) {
      this._previousDragPosition = newPosition;

      // Regenerate the grid with the positions from when the drag started
      GridList.cloneItems(this._items, this.items);
      this.gridList.generateGrid();

      // Since the items list is a deep copy, we need to fetch the item
      // corresponding to this drag action again
      item = this._getItemByElement(ui.helper);
      this.gridList.moveItemToPosition(item, newPosition);

      // Visually update item positions and highlight shape
      this._applyPositionToItems();
      this._highlightPositionForItem(item);
    }
  }

  _onStop(event, ui) {
    this._updateGridSnapshot();
    this._previousDragPosition = null;

    // HACK: jQuery.draggable removes this class after the dragstop callback,
    // and we need it removed before the drop, to re-enable CSS transitions
    // $(ui.helper).removeClass('ui-draggable-dragging');
    document.querySelector('ui.helper').classList.remove('ui-draggable-dragging');


    this._applyPositionToItems();
    this._removePositionHighlight();
  }

  _generateItemsFromDOM() {
    /**
     * Generate the structure of items used by the GridList lib, using the DOM
     * data of the children of the targeted element. The items will have an
     * additional reference to the initial DOM element attached, in order to
     * trace back to it and re-render it once its properties are changed by the
     * GridList lib
     */
    // var _this = this;
    var items = [];
    // var item;

    // this.$items.each(function(i, element) {
    Array.from(this.$items, function(element) {
      items.push({
        $element: element,
        x: Number(element.getAttribute('data-x')),
        y: Number(element.getAttribute('data-y')),
        w: Number(element.getAttribute('data-w')),
        h: Number(element.getAttribute('data-h')),
        id: Number(element.getAttribute('data-id'))
      });
    });
    return items;
  }

  _getItemByElement(element) {
    // XXX: this could be optimized by storing the item reference inside the
    // meta data of the DOM element
    // for (var i = 0; i < this.items.length; i++) {
    //   if (this.items[i].$element.is(element)) {
    //     return this.items[i];
    //   }
    // }

    return this.items.find((item) => {
      item.$element === element;
    });
  }

  _calculateCellSize() {
    if (this.options.direction === 'horizontal') {
      this._cellHeight = Math.floor(this.element.offsetHeight / this.options.lanes);
      this._cellWidth = this._cellHeight * this.options.widthHeightRatio;
    } else {
      this._cellWidth = Math.floor(this.$element.width() / this.options.lanes);
      this._cellHeight = this._cellWidth / this.options.widthHeightRatio;
    }
    if (this.options.heightToFontSizeRatio) {
      this._fontSize = this._cellHeight * this.options.heightToFontSizeRatio;
    }
  }

  _getItemWidth(item) {
    return item.w * this._cellWidth;
  }

  _getItemHeight(item) {
    return item.h * this._cellHeight;
  }

  _applySizeToItems() {
    // for (var i = 0; i < this.items.length; i++) {
    //   this.items[i].$element.css({
    //     width: this._getItemWidth(this.items[i]),
    //     height: this._getItemHeight(this.items[i])
    //   });
    // }
    this.items.forEach((item) => {
      item.$element.style.width = this._getItemWidth(item);
      item.$element.style.height = this._getItemHeight(item);
    });

    if (this.options.heightToFontSizeRatio) {
      this.$items.css('font-size', this._fontSize);
    }
  }

  _applyPositionToItems() {
    this.items.forEach((item) => {
      // Don't interfere with the positions of the dragged items
      if (!item.move) {
        item.$element.style.left = item.x * this._cellWidth;
        item.$element.style.top = item.y * this._cellHeight;
      }
    });

    // Update the width of the entire grid container with enough room on the
    // right to allow dragging items to the end of the grid.
    if (this.options.direction === 'horizontal') {
      this.element.style.width = (this.gridList.grid.length + this._widestItem) * this._cellWidth;
    } else {
      this.element.style.height = (this.gridList.grid.length + this._tallestItem) * this._cellHeight;
    }
  }

  _dragPositionChanged(newPosition) {
    if (!this._previousDragPosition) {
      return true;
    }
    return (newPosition[0] !== this._previousDragPosition[0] ||
            newPosition[1] !== this._previousDragPosition[1]);
  }

  _snapItemPositionToGrid(item) {
    var position = item.$element.position();

    position[0] -= this.$element.position().left;

    var col = Math.round(position.left / this._cellWidth);
    var row = Math.round(position.top / this._cellHeight);

    // Keep item position within the grid and don't let the item create more
    // than one extra column
    col = Math.max(col, 0);
    row = Math.max(row, 0);

    if (this.options.direction === 'horizontal') {
      col = Math.min(col, this._maxGridCols);
      row = Math.min(row, this.options.lanes - item.h);
    } else {
      col = Math.min(col, this.options.lanes - item.w);
      row = Math.min(row, this._maxGridCols);
    }

    return [col, row];
  }

  _highlightPositionForItem(item) {
    this.$positionHighlight.css({
      width: this._getItemWidth(item),
      height: this._getItemHeight(item),
      left: item.x * this._cellWidth,
      top: item.y * this._cellHeight
    }).show();
    if (this.options.heightToFontSizeRatio) {
      this.$positionHighlight.css('font-size', this._fontSize);
    }
  }

  _removePositionHighlight() {
    this.$positionHighlight.hide();
  }

  _createGridSnapshot() {
    this._items = GridList.cloneItems(this.items);
  }

  _updateGridSnapshot() {
    // Notify the user with the items that changed since the previous snapshot
    this._triggerOnChange();
    GridList.cloneItems(this.items, this._items);
  }

  _triggerOnChange() {
    if (typeof this.options.onChange !== 'function') {
      return;
    }
    this.options.onChange.call(
      this, this.gridList.getChangedItems(this._items, '$element'));
  }
};



/*

// new:
instance = new DraggableGridList(this, options, draggableOptions);
$(this).data('_gridList', instance);

// call fn
instance[method].apply(instance, args);

*/