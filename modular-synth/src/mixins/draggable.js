// const
let dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  startX: null,
  startY: null
};

/**
 * Draggable.
 * This mixin enables dragging of a Component. A position Object is updated in the Component's
 * data, and any/all connections to any inputs/outputs are also updated and redrawn.
 * @type {Object}
 */
import { updatePosition } from '../vuex/actions';

export const draggable = {
  vuex: {
    actions: {
      updatePosition
    }
  },

  props: {
    x: 0,
    y: 0
  },

  data() {
    return {
      dragging: false
    };
  },

  computed: {
    position() {
      return {
        left: this.x + 'px',
        top: this.y + 'px'
      };
    }
  },

  methods: {
    startDragging(event) {
      const node = this.$el;
      node.style.zIndex = ++dragObj.zIndex;     // Update element's z-index.

      this.dragging = true;

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = event.clientX;
      dragObj.cursorStartY = event.clientY;
      dragObj.startX = this.x;
      dragObj.startY = this.y;

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingNode);
      document.addEventListener('mouseup', this.stopDraggingNode);
    },

    whileDragging(event) {
      const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
      const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

      this.updatePosition(this.id, x, y);

      this.x = x;
      this.y = y;
    },

    stopDragging(event) {
      document.removeEventListener('mousemove', this.whileDraggingNode);
      document.removeEventListener('mouseup', this.stopDraggingNode);
      this.dragging = false;
    }
  }
};
