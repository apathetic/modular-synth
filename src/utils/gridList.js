
const defaults = {
  lanes: 3,
  direction: 'horizontal'
};


export default class GridList {
  /**
   * A GridList manages the two-dimensional positions from a list of items,
   * within a virtual matrix.
   *
   * The GridList's main function is to convert the item positions from one
   * grid size to another, maintaining as much of their order as possible.
   *
   * The GridList's second function is to handle collisions when moving an item
   * over another.
   *
   * The positioning algorithm places items in columns. Starting from left to
   * right, going through each column top to bottom.
   *
   * The size of an item is expressed using the number of cols and rows it
   * takes up within the grid (w and h)
   *
   * The position of an item is express using the col and row position within
   * the grid (x and y)
   *
   * An item is an object of structure:
   * {
   *   w: 3, h: 1,
   *   x: 0, y: 1
   * }
   */
  constructor(items, options) {
    this._options = Object.assign(defaults, options);
    this.items = items;
    // this._adjustSizeOfItems();
    this.generateGrid();
  }

  /**
   * Illustates grid as text-based table, using a number identifier for each
   * item. E.g.
   *
   *  #|  0  1  2  3  4  5  6  7  8  9 10 11 12 13
   *  --------------------------------------------
   *  0| 00 02 03 04 04 06 08 08 08 12 12 13 14 16
   *  1| 01 -- 03 05 05 07 09 10 11 11 -- 13 15 --
   *
   * Warn: Does not work if items don't have a width or height specified
   * besides their position in the grid.
   */
  toString() {
    var widthOfGrid = this.grid.length;
    var output = '\n #|';
    var border = '\n --';
    var item;
    var i;
    var j;
    // var id;

    // Render the table header
    for (i = 0; i < widthOfGrid; i++) {
      output += ' ' + this._padNumber(i, ' ');
      border += '---';
    }
    output += border;

    // Render table contents row by row, as we go on the y axis
    for (i = 0; i < this._options.lanes; i++) {
      output += '\n' + this._padNumber(i, ' ') + '|';
      for (j = 0; j < widthOfGrid; j++) {
        output += ' ';
        item = this.grid[j][i];
        // id = this.items.indexOf(item);
        // id = item.id;
        output += item ? this._padNumber(item.id, '0') : '--';
      }
    }
    output += '\n';
    return output;
  }

  generateGrid() {
    /**
     * Build the grid structure from scratch, with the current item positions
     */
    var i;
    this._resetGrid();
    for (i = 0; i < this.items.length; i++) {
      this._markItemPositionToGrid(this.items[i]);
    }
  }

  resizeGrid(lanes) {
    var currentColumn = 0;

    this._options.lanes = lanes;
    // this._adjustSizeOfItems();

    this._sortItemsByPosition();
    this._resetGrid();

    // The items will be sorted based on their index within the this.items array,
    // that is their "1d position"
    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      var position = this._getItemPosition(item);

      this._updateItemPosition(
        item,
        this.findPositionForItem(item, {col: currentColumn, row: 0})
      );

      // New items should never be placed to the left of previous items
      currentColumn = Math.max(currentColumn, position.col);
    }

    this._pullItemsToLeft();
  }

  findPositionForItem(item, start, fixedRow) {
    /**
     * This method has two options for the position we want for the item:
     * - Starting from a certain row/column number and only looking for
     *   positions to its right
     * - Accepting positions for a certain row number only (use-case: items
     *   being shifted to the left/right as a result of collisions)
     *
     * @param {Object<x:Number, y:Number, w:Number, h:Number} item
     * @param {Object<x:Number, y:Number} start Position from which to start
     *     the search.
     * @param {Number} [fixedRow] If provided, we're going to try to find a
     *     position for the new item on it. If doesn't fit there, we're going
     *     to put it on the first row.
     *
     * @returns {Number[2]} x and y.
     */

    var x, y, position;

    // Start searching for a position from the horizontal position of the
    // rightmost item from the grid
    for (x = start.col; x < this.grid.length; x++) {
      if (fixedRow !== undefined) {
        position = [x, fixedRow];

        if (this._itemFitsAtPosition(item, position)) {
          return position;
        }
      } else {
        for (y = start.row; y < this._options.lanes; y++) {
          position = [x, y];

          if (this._itemFitsAtPosition(item, position)) {
            return position;
          }
        }
      }
    }

    // If we've reached this point, we need to start a new column
    var newCol = this.grid.length;
    var newRow = 0;

    if (fixedRow !== undefined &&
        this._itemFitsAtPosition(item, [newCol, fixedRow])) {
      newRow = fixedRow;
    }

    return [newCol, newRow];
  }

  moveItemToPosition(item, newPosition) {
    var position = this._getItemPosition({
      col: newPosition[0],
      row: newPosition[1],
      w: item.w,
      h: item.h
    });

    this._updateItemPosition(item, [position.col, position.row]);
    this._resolveCollisions(item);
  }

  // resizeItem(item, size) {
  //   /**
  //    * Resize an item and resolve collisions.
  //    *
  //    * @param {Object} item A reference to an item that's part of the grid.
  //    * @param {Object} size
  //    * @param {Number} [size.w=item.w] The new width.
  //    * @param {Number} [size.h=item.h] The new height.
  //    */
  //
  //   var width = size.w || item.w;
  //   var height = size.h || item.h;
  //
  //   this._updateItemSize(item, width, height);
  //
  //   this._resolveCollisions(item);
  //
  //   this._pullItemsToLeft();
  // }

  getChangedItems(initialItems, idAttribute) {
    /**
     * Compare the current items against a previous snapshot and return only
     * the ones that changed their attributes in the meantime. This includes both
     * position (x, y) and size (w, h)
     *
     * Since both their position and size can change, the items need an
     * additional identifier attribute to match them with their previous state
     */
    var changedItems = [];

    for (var i = 0; i < initialItems.length; i++) {
      var item = this._getItemByAttribute(idAttribute, initialItems[i][idAttribute]);

      if (item.col !== initialItems[i].col ||
          item.row !== initialItems[i].row ||
          item.w !== initialItems[i].w ||
          item.h !== initialItems[i].h) {
        changedItems.push(item);
      }
    }

    return changedItems;
  }

  _sortItemsByPosition() {
    this.items.sort(function(item1, item2) {
      var position1 = this._getItemPosition(item1);
      var position2 = this._getItemPosition(item2);

      // Try to preserve columns.
      if (position1.col !== position2.col) {
        return position1.col - position2.col;
      }

      if (position1.row !== position2.row) {
        return position1.row - position2.row;
      }

      // The items are placed on the same position.
      return 0;
    }.bind(this));
  }

  // _adjustSizeOfItems() {
  //   /**
  //    * Some items can have 100% height or 100% width. Those constants are
  //    * expressed as 0. We need to ensure a valid width and height for each of
  //    * those items as the number of items per lane.
  //    */
  //
  //   for (var i = 0; i < this.items.length; i++) {
  //     var item = this.items[i];
  //
  //     // This can happen only the first time items are checked.
  //     // We need the property to have a value for all the items so that the
  //     // `cloneItems` method will merge the properties properly. If we only set
  //     // it to the items that need it then the following can happen:
  //     //
  //     // cloneItems([{id: 1, autoSize: true} {id: 2}],
  //     //            [{id: 2} {id: 1, autoSize: true}]);
  //     //
  //     // will result in
  //     //
  //     // [{id: 1, autoSize: true} {id: 2, autoSize: true}]
  //     if (item.autoSize === undefined) {
  //       item.autoSize = item.w === 0 || item.h === 0;
  //     }
  //
  //     if (item.autoSize) {
  //       if (this._options.direction === 'horizontal') {
  //         item.h = this._options.lanes;
  //       } else {
  //         item.w = this._options.lanes;
  //       }
  //     }
  //   }
  // }

  _resetGrid() {
    this.grid = [];
  }

  _itemFitsAtPosition(item, newPosition) {
    /**
     * Check that an item wouldn't overlap with another one if placed at a
     * certain position within the grid
     */

    var position = this._getItemPosition(item);
    var x;
    var y;

    // No coordonate can be negative
    if (newPosition[0] < 0 || newPosition[1] < 0) {
      return false;
    }

    // Make sure the item isn't larger than the entire grid
    if (newPosition[1] + position.h > this._options.lanes) {
      return false;
    }

    // Make sure the position doesn't overlap with an already positioned
    // item.
    for (x = newPosition[0]; x < newPosition[0] + position.w; x++) {
      var col = this.grid[x];

      // Surely a column that hasn't even been created yet is available
      if (!col) {
        continue;
      }

      for (y = newPosition[1]; y < newPosition[1] + position.h; y++) {
        // Any space occupied by an item can continue to be occupied by the
        // same item.
        if (col[y] && col[y] !== item) {
          return false;
        }
      }
    }

    return true;
  }

  _updateItemPosition(item, position) {
    if (item.col !== null && item.row !== null) {
      this._deleteItemPositionFromGrid(item);
    }

    this._setItemPosition(item, position);

    this._markItemPositionToGrid(item);
  }

  // _updateItemSize(item, width, height) {
  //   /**
  //    * @param {Object} item A reference to a grid item.
  //    * @param {Number} width The new width.
  //    * @param {Number} height The new height.
  //    */
  //
  //   if (item.col !== null && item.row !== null) {
  //     this._deleteItemPositionFromGrid(item);
  //   }
  //
  //   item.w = width;
  //   item.h = height;
  //
  //   this._markItemPositionToGrid(item);
  // }

  _markItemPositionToGrid(item) {
    /**
     * Mark the grid cells that are occupied by an item. This prevents items
     * from overlapping in the grid
     */

    var position = this._getItemPosition(item);
    var x;
    var y;

    // Ensure that the grid has enough columns to accomodate the current item.
    this._ensureColumns(position.col + position.w);

    for (x = position.col; x < position.col + position.w; x++) {
      for (y = position.row; y < position.row + position.h; y++) {
        this.grid[x][y] = item;
      }
    }
  }

  _deleteItemPositionFromGrid(item) {
    var position = this._getItemPosition(item);
    var x;
    var y;

    for (x = position.col; x < position.col + position.w; x++) {
      // It can happen to try to remove an item from a position not generated
      // in the grid, probably when loading a persisted grid of items. No need
      // to create a column to be able to remove something from it, though
      if (!this.grid[x]) {
        continue;
      }

      for (y = position.row; y < position.row + position.h; y++) {
        // Don't clear the cell if it's been occupied by a different widget in
        // the meantime (e.g. when an item has been moved over this one, and
        // thus by continuing to clear this item's previous position you would
        // cancel the first item's move, leaving it without any position even)
        if (this.grid[x][y] === item) {
          this.grid[x][y] = null;
        }
      }
    }
  }

  _ensureColumns(N) {
    /**
     * Ensure that the grid has at least N columns available.
     */
    var i;
    for (i = 0; i < N; i++) {
      if (!this.grid[i]) {
        // this.grid.push(new GridCol(this._options.lanes));
        this.grid.push(new Array(this._options.lanes).fill(null));
      }
    }
  }

  _getItemsCollidingWithItem(item) {
    var collidingItems = [];
    for (var i = 0; i < this.items.length; i++) {
      if (item !== this.items[i] &&
          this._itemsAreColliding(item, this.items[i])) {
        collidingItems.push(i);
      }
    }
    return collidingItems;
  }

  _itemsAreColliding(item1, item2) {
    var position1 = this._getItemPosition(item1);
    var position2 = this._getItemPosition(item2);

    return !(position2.col >= position1.col + position1.w ||
             position2.col + position2.w <= position1.col ||
             position2.row >= position1.row + position1.h ||
             position2.row + position2.h <= position1.row);
  }

  _resolveCollisions(item) {
    if (!this._tryToResolveCollisionsLocally(item)) {
      this._pullItemsToLeft(item);
    }
    this._pullItemsToLeft();
  }

  _tryToResolveCollisionsLocally(item) {
    /**
     * Attempt to resolve the collisions after moving a an item over one or more
     * other items within the grid, by shifting the position of the colliding
     * items around the moving one. This might result in subsequent collisions,
     * in which case we will revert all position permutations. To be able to
     * revert to the initial item positions, we create a virtual grid in the
     * process
     */
    var collidingItems = this._getItemsCollidingWithItem(item);
    if (!collidingItems.length) {
      return true;
    }
    var _gridList = new GridList([], this._options);
    var leftOfItem;
    var rightOfItem;
    // var aboveOfItem;
    // var belowOfItem;

    _gridList.items = Object.keys(this.items).map(key => this.items[key]);
    _gridList.generateGrid();

    for (var i = 0; i < collidingItems.length; i++) {
      var collidingItem = _gridList.items[collidingItems[i]];
      var collidingPosition = this._getItemPosition(collidingItem);

      // We use a simple algorithm for moving items around when collisions occur:
      // In this prioritized order, we try to move a colliding item around the
      // moving one:
      // 1. to its left side
      // 2. above it    [wes] no, removed
      // 3. under it    [wes] no, removed
      // 4. to its right side
      var position = this._getItemPosition(item);

      leftOfItem = [position.col - collidingPosition.w, collidingPosition.row];
      rightOfItem = [position.col + position.w, collidingPosition.row];
      // aboveOfItem = [collidingPosition.col, position.row - collidingPosition.h];
      // belowOfItem = [collidingPosition.col, position.row + position.h];

      if (_gridList._itemFitsAtPosition(collidingItem, leftOfItem)) {
        _gridList._updateItemPosition(collidingItem, leftOfItem);
      // } else if (_gridList._itemFitsAtPosition(collidingItem, aboveOfItem)) {
      //   _gridList._updateItemPosition(collidingItem, aboveOfItem);
      // } else if (_gridList._itemFitsAtPosition(collidingItem, belowOfItem)) {
      //   _gridList._updateItemPosition(collidingItem, belowOfItem);
      } else if (_gridList._itemFitsAtPosition(collidingItem, rightOfItem)) {
        _gridList._updateItemPosition(collidingItem, rightOfItem);
      } else {
        // Collisions failed, we must use the pullItemsToLeft method to arrange
        // the other items around this item with fixed position. This is our
        // plan B for when local collision resolving fails.
        return false;
      }
    }
    // If we reached this point it means we managed to resolve the collisions
    // from one single iteration, just by moving the colliding items around. So
    // we accept this scenario and marge the brached-out grid instance into the
    // original one
    // cloneItems(_gridList.items, this.items);
    this.items = Object.keys(_gridList.items).map(key => _gridList.items[key]);

    this.generateGrid();
    return true;
  }

  _pullItemsToLeft(fixedItem) {
    /**
     * Build the grid from scratch, by using the current item positions and
     * pulling them as much to the left as possible, removing as space between
     * them as possible.
     *
     * If a "fixed item" is provided, its position will be kept intact and the
     * rest of the items will be layed around it.
     */


    // Start a fresh grid with the fixed item already placed inside
    this._sortItemsByPosition();
    this._resetGrid();

    // Start the grid with the fixed item as the first positioned item
    if (fixedItem) {
      var fixedPosition = this._getItemPosition(fixedItem);
      this._updateItemPosition(fixedItem, [fixedPosition.col, fixedPosition.row]);
    }

    for (var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      var position = this._getItemPosition(item);

      // The fixed item keeps its exact position
      if (fixedItem && item === fixedItem) {
        continue;
      }

      var col = this._findLeftMostPositionForItem(item);
      var newPosition = this.findPositionForItem(item, {col: col, row: 0}, position.row);

      this._updateItemPosition(item, newPosition);
    }
  }

  _findLeftMostPositionForItem(item) {
    /**
     * When pulling items to the left, we need to find the leftmost position for
     * an item, with two considerations in mind:
     * - preserving its current row
     * - preserving the previous horizontal order between items
     */

    var tail = 0;
    var position = this._getItemPosition(item);

    for (var i = 0; i < this.grid.length; i++) {
      for (var j = position.row; j < position.row + position.h; j++) {
        var otherItem = this.grid[i][j];

        if (!otherItem) {
          continue;
        }

        var otherPosition = this._getItemPosition(otherItem);

        if (this.items.indexOf(otherItem) < this.items.indexOf(item)) {
          tail = otherPosition.col + otherPosition.w;
        }
      }
    }

    return tail;
  }

  _getItemByAttribute(key, value) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i][key] === value) {
        return this.items[i];
      }
    }
    return null;
  }

  _padNumber(nr, prefix) {
    // Currently works for 2-digit numbers (<100)
    return nr >= 10 ? nr : prefix + nr;
  }

  _getItemPosition(item) {
    /**
     * If the direction is vertical we need to rotate the grid 90 deg to the
     * left. Thus, we simulate the fact that items are being pulled to the top.
     *
     * Since the items have widths and heights, if we apply the classic
     * counter-clockwise 90 deg rotation
     *
     *     [0 -1]
     *     [1  0]
     *
     * then the top left point of an item will become the bottom left point of
     * the rotated item. To adjust for this, we need to subtract from the y
     * position the height of the original item - the width of the rotated item.
     *
     * However, if we do this then we'll reverse some actions: resizing the
     * width of an item will stretch the item to the left instead of to the
     * right; resizing an item that doesn't fit into the grid will push the
     * items around it instead of going on a new row, etc.
     *
     * We found it better to do a vertical flip of the grid after rotating it.
     * This restores the direction of the actions and greatly simplifies the
     * transformations.
     */

    if (this._options.direction === 'horizontal') {
      return item;
    } else {
      return {
        row: item.row,
        col: item.col,
        w: item.h,
        h: item.w
      };
    }
  }

  _setItemPosition(item, position) {
    /**
     * See _getItemPosition.
     */

    if (this._options.direction === 'horizontal') {
      item.col = position[0];
      item.row = position[1];
    } else {
      // We're supposed to subtract the rotated item's height which is actually
      // the non-rotated item's width.
      item.col = position[1];
      item.row = position[0];
    }
  }
}
