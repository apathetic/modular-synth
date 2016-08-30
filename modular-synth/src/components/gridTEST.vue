<template>
  <div class="grid-container">
    <div v-el:grid class="grid">

      <node v-for="item in items"

      :id="$index"
      :w="item.w"
      :h="item.h"
      :x="item.x"
      :y="item.y"

      :height="item.height"
      :width="item.width"
      :left="item.left"
      :top="item.top"
      >
        <div class="inner">
          {{ $index }}
        </div>

      </node>

    <div>
  </div>
</template>

<script>
import GridList from '../../static/js/gridList';  // TODO more this. move static
import Node from './Node';

export default {
  components: {
    Node
  },

  data() {
    return {
      items: [
        {w: 1, h: 1, x: 0, y: 0, width: '', height: '', left: '', top: ''},
        {w: 1, h: 2, x: 0, y: 1, width: '', height: '', left: '', top: ''},
        {w: 2, h: 2, x: 1, y: 0, width: '', height: '', left: '', top: ''},
        {w: 1, h: 1, x: 1, y: 2, width: '', height: '', left: '', top: ''},
        {w: 2, h: 1, x: 2, y: 2, width: '', height: '', left: '', top: ''},
        {w: 1, h: 1, x: 3, y: 0, width: '', height: '', left: '', top: ''},
        {w: 1, h: 1, x: 3, y: 1, width: '', height: '', left: '', top: ''},
        {w: 1, h: 0, x: 4, y: 0, width: '', height: '', left: '', top: ''},
        {w: 3, h: 1, x: 5, y: 0, width: '', height: '', left: '', top: ''},
        {w: 2, h: 1, x: 5, y: 1, width: '', height: '', left: '', top: ''},
        {w: 1, h: 1, x: 5, y: 2, width: '', height: '', left: '', top: ''},
        {w: 2, h: 1, x: 6, y: 2, width: '', height: '', left: '', top: ''},
        {w: 1, h: 1, x: 7, y: 1, width: '', height: '', left: '', top: ''},
        {w: 2, h: 0, x: 8, y: 0, width: '', height: '', left: '', top: ''},
        {w: 1, h: 1, x: 10, y: 0, width: '', height: '', left: '', top: ''},
        {w: 1, h: 1, x: 10, y: 1, width: '', height: '', left: '', top: ''},
        {w: 1, h: 1, x: 10, y: 2, width: '', height: '', left: '', top: ''}
      ],

      options: {
        lanes: 3,
        direction: 'horizontal',
        itemSelector: '.module',
        widthHeightRatio: 1,
        dragAndDrop: true
      },

      draggableOptions: {
        zIndex: 2,
        scroll: false,
        containment: 'parent'
      }
    };
  },

  ready() {
    this.handle = this.$els.grid;
    this._init();
    this._bindEvents();


    // "LOAD" (ie set up fixtures)
    // ---------------------------------------
    // const items = this.items; // for now... should be HTMLELments (not Array of Objects)
    // var grid = new GridList(this.items, {
    //   direction: 'horizontal',
    //   lanes: 2
    // });
    //
    window.addEventListener('resize', function() {
      this.gridList.resizeGrid(this.options.lanes);   // mmm, this is unbound, here. () => prolly wont work neither
    }.bind(this));


    // "GRIDLIST"
    // ---------------------------------------
    // const element = document.querySelector('#grid');
    // const element = this.$els.grid;

    // const options = {};
    // const draggableOptions = {};
    // const instance = new DraggableGridList(element, options, draggableOptions);
    // this.constructor(element);

    // this.instance = instance;
    // then:
    // instance.resizeItem()...
    // instance.generateGrid(), etc...
  },

  methods: {

    // constructor(handle, options, draggableOptions) {
    //   // this.options = Object.assign({}, this.defaults, options);
    //   // this.draggableOptions = Object.assign({}, this.draggableDefaults, draggableOptions);
    //   // this.$element = $(element);
    //
    //   this.handle = handle;
    //   this._init();
    //   this._bindEvents();
    // },


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
    },

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
    },

    reflow() {
      this._calculateCellSize();
      this.render();
    },

    render() {
      this._applySizeToItems();
      this._applyPositionToItems();
    },

    _bindMethod(fn) {
      /**
       * Bind prototype method to instance scope (similar to CoffeeScript's fat
       * arrow)
       */
      var that = this;
      return function() {
        return fn.apply(that, arguments);
      };
    },

    _init() {
      // Read items and their meta data. Ignore other list elements (like the
      // position highlight)
      // this.elements = this.handle.children(this.options.itemSelector);
      this.elements = this.handle.querySelectorAll(this.options.itemSelector);

      // OBJECTS with x, y, w, h and id. Also, a ref to $el. Stored in an Array.  ... Duplicated now, with data() ?
      // this.items = this._generateItemsFromDOM();

      // console.log(this.elements);
      // console.log(this.items);

      this._widestItem = Math.max.apply(null, this.items.map(function(item) { return item.w; }));
      this._tallestItem = Math.max.apply(null, this.items.map(function(item) { return item.h; }));

      // Used to highlight a position an element will land on upon drop
      // TODO: this:
      this.$positionHighlight = this.handle.querySelectorAll('.position-highlight'); // .hide();
      Array.from(this.$positionHighlight, (el) => { el.style.display = 'none'; });

      this._initGridList();
      this.reflow();

      if (this.options.dragAndDrop) {



        // Init Draggable JQuery UI plugin for each of the list items
        // http://api.jqueryui.com/draggable/
        // this.elements.draggable(this.draggableOptions);



      }
    },

    _initGridList() {
      // Create instance of GridList (decoupled lib for handling the grid
      // positioning and sorting post-drag and dropping)
      this.gridList = new GridList(this.items, {
        lanes: this.options.lanes,
        direction: this.options.direction
      });
    },

    _bindEvents() {
      this._onStart = this._bindMethod(this._onStart);
      this._onDrag = this._bindMethod(this._onDrag);
      this._onStop = this._bindMethod(this._onStop);

      // this.elements.on('dragstart', this._onStart);
      // this.elements.on('drag', this._onDrag);
      // this.elements.on('dragstop', this._onStop);
      Array.from(this.elements, (item) => {
        item.addEventListener('dragstart', this._onStart);
        item.addEventListener('drag', this._onDrag);
        item.addEventListener('dragstop', this._onStop);
      });
    },

    // _unbindEvents() {
    //   this.elements.off('dragstart', this._onStart);
    //   this.elements.off('drag', this._onDrag);
    //   this.elements.off('dragstop', this._onStop);
    // }

    _onStart(event, ui) {
      // Create a deep copy of the items; we use them to revert the item
      // positions after each drag change, making an entire drag operation less
      // distructable
      this._createGridSnapshot();

      // Since dragging actually alters the grid, we need to establish the number
      // of cols (+1 extra) before the drag starts

      this._maxGridCols = this.gridList.grid.length;
    },

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
    },

    _onStop(event, ui) {
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

    _getItemByElement(element) {
      // XXX: this could be optimized by storing the item reference inside the
      // meta data of the DOM element
      // for (var i = 0; i < this.items.length; i++) {
      //   if (this.items[i].$element.is(element)) {
      //     return this.items[i];
      //   }
      // }

      return this.items.find((item) => {
        // TODO: i think only components have $el.  How to reference each item's HTMLElement in the template
        console.log(item);
        item.$el === element;
      });
    },

    _calculateCellSize() {
      if (this.options.direction === 'horizontal') {
        this._cellHeight = Math.floor(this.handle.offsetHeight / this.options.lanes);
        this._cellWidth = this._cellHeight * this.options.widthHeightRatio;
      } else {
        this._cellWidth = Math.floor(this.$element.width() / this.options.lanes);
        this._cellHeight = this._cellWidth / this.options.widthHeightRatio;
      }
      if (this.options.heightToFontSizeRatio) {
        this._fontSize = this._cellHeight * this.options.heightToFontSizeRatio;
      }
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
      this.items.forEach((item) => {
        // Don't interfere with the positions of the dragged items
        if (!item.move) {
          item.left = item.x * this._cellWidth;
          item.top = item.y * this._cellHeight;
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
    },

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
    },

    _removePositionHighlight() {
      this.$positionHighlight.hide();
    },

    _createGridSnapshot() {
      this._items = GridList.cloneItems(this.items);
    },

    _updateGridSnapshot() {
      // Notify the user with the items that changed since the previous snapshot
      this._triggerOnChange();
      GridList.cloneItems(this.items, this._items);
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
</script>

<style>
  .grid-container {
    z-index: 9999;
    position: absolute;
    top: 66px;
    left: 0;
    right: 10px;
    bottom: 0;
    overflow: auto;
  }
  .grid {
    position: relative;
    height: 100%;
    list-style: none;
    /* Will be modified by the grid jquery lib, depending on the items */
    transition: width 0.2s,
                height 0.2s;
  }
    .grid .module {

      height: 200px; width: 200px;
      position: absolute;

      /*z-index: 1;
      font-weight: bold;
      line-height: 4em;
      text-align: center;
      cursor: pointer;
      transition: top 0.2s,
                  left 0.2s,
                  width 0.2s,
                  height 0.2s,
                  font-size 0.2s,
                  line-height 0.2s;*/
    }
    .grid .module .inner {
      position: absolute;
      background: #fff;
      border: 1px solid #bbb;
      top: 0;
      bottom: 10px;
      left: 10px;
      right: 0;
      -webkit-transition: background 3s;
              transition: background 3s;

      color: red;
    }
    .grid .module.changed .inner {
      background: #ffff66;
      -webkit-transition: none;
              transition: none;
    }
    .grid .module.ui-draggable-dragging {
      -webkit-transition: none;
              transition: none;
    }
    .grid .module.position-highlight {
      -webkit-transition: none;
              transition: none;
    }
      .grid li.position-highlight .inner {
        border: none;
        background: #ccc;
      }


</style>
