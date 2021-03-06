/**
 * Draggable.
 * This mixin enables dragging of a Component. A position Object is updated in the Component's
 * data, and any/all connections to any inputs/outputs are also updated and redrawn.
 * @type {Object}
 */

import { rackWidth, rackHeight } from '../constants';
import { EVENT } from '../events';

const dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  startX: null,
  startY: null
};

export const draggable = {
  computed: {
    position() {
      const compute = this.$store.getters.editing || this.isDragging;
      return {
        left: (compute) ? this.x + 'px' : this.module.col * rackWidth + 'px',
        top: (compute) ? this.y + 'px' : this.module.row * rackHeight + 'px'
      };
    }
  },

  data() {
    return {
      x: 0,
      y: 0,
      isDragging: false
    };
  },

  created() {
    this.x = this.module.x;
    this.y = this.module.y;
  },

  methods: {
    startDragging(event) {
      const node = this.$el;
      const x = node.offsetLeft;  // Calculate explicity because could be in play mode, in which ...
      const y = node.offsetTop;   // case x,y would not pertain to the actual node coords.

      node.style.zIndex = ++dragObj.zIndex;     // Update element's z-index.

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = event.clientX;
      dragObj.cursorStartY = event.clientY;
      dragObj.startX = x;
      dragObj.startY = y;

      this.isDragging = true;
      this.x = x;                 // necessary as the module's internal coords may be different if in play mode
      this.y = y;

      this.$bus.$emit(EVENT.DRAG_START, [x, y], this.$el);

      // Capture mousemove and mouseup events on the page.
      document.addEventListener(EVENT.MOUSE_MOVE, this.whileDragging);
      document.addEventListener(EVENT.MOUSE_UP, this.stopDragging);
    },

    whileDragging(event) {
      const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
      const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

      // we _always_ want to change the module's coordinates
      // while dragging, whether in editing mode or not:
      this.x = x;
      this.y = y;

      this.$bus.$emit(EVENT.DRAG_ACTIVE, [x, y], this.$el);
    },

    stopDragging(event) {
      this.isDragging = false;
      this.$bus.$emit(EVENT.DRAG_END, this.id);

      if (this.$store.getters.editing) {      // TODO && cursorStartY != this.y etc
        // we only want to update the Store with the
        // new coordinates if we are in editing mode:
        this.$store.commit('UPDATE_GRID_POSITION', {
          id: this.module.id,
          x: this.x,
          y: this.y
        });
      } else {
        // otherwise, restore the x,y coordinates -- we don't want the
        // module to have moved around when we switch out of play mode
        // const active = this.$store.state.app.active;
        // const module = this.$store.getters.module(active);
        const module = this.$store.getters.activeModule;

        this.x = module.x;
        this.y = module.y;
      }

      document.removeEventListener(EVENT.MOUSE_MOVE, this.whileDragging);
      document.removeEventListener(EVENT.MOUSE_UP, this.stopDragging);
    }
  }
};
