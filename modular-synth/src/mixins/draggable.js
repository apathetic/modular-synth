/**
 * Draggable.
 * This mixin enables dragging of a Component. A position Object is updated in the Component's
 * data, and any/all connections to any inputs/outputs are also updated and redrawn.
 * @type {Object}
 */

import { rackWidth, rackHeight } from '../dimensions';

const dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  startX: null,
  startY: null
};

export const draggable = {
  props: {
    coords: Object
  },

  computed: {
    position() {
      return {
        left: (this.$store.state.editing || this.dragging) ? this.x + 'px' : (this.col * rackWidth) + 'px', // * this.w
        top: (this.$store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
      };
    }
  },

  data() {
    return {
      x: 0,
      y: 0,
      dragging: false
    };
  },

  created() {
    this.x = this.coords.x;
    this.y = this.coords.y;
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

      this.dragging = true;
      this.x = x;                 // necessary as the module's internal coords may be different if in play mode
      this.y = y;

      this.$bus.$emit('drag:start', [x, y], this.$el);

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDragging);
      document.addEventListener('mouseup', this.stopDragging);
    },

    whileDragging(event) {
      const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
      const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

      // we _always_ want to change the module's coordinates
      // while dragging, whether in editing mode or not:
      this.x = x;
      this.y = y;

      this.$bus.$emit('drag:active', [x, y], this.$el);
    },

    stopDragging(event) {
      this.dragging = false;
      this.$bus.$emit('drag:end', this.id);

      if (this.$store.state.editing) {      // TODO && cursorStartY != this.y etc
        // we only want to update the Store with the
        // new coordinates if we are in editing mode:
        this.$store.commit('UPDATE_GRID_POSITION', {
          id: this.id,
          x: this.x,
          y: this.y
        });
      } else {
        // otherwise, restore the x,y coordinates -- we don't want the
        // module to have moved around when we switch out of play mode
        const module = this.$store.getters.active;

        this.x = module.x;
        this.y = module.y;
      }

      document.removeEventListener('mousemove', this.whileDragging);
      document.removeEventListener('mouseup', this.stopDragging);
    }
  }
};
