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
    startDraggingNode(event) {
      const node = this.$el;  // event.target;

      // if (!event.target.classList.contains('module-interface')) {
      //   return;
      // }

      this.dragging = true;

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = event.clientX;
      dragObj.cursorStartY = event.clientY;
      dragObj.startX = this.x;
      dragObj.startY = this.y;

      // Update element's z-index.
      node.style.zIndex = ++dragObj.zIndex;
      //
      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingNode);
      document.addEventListener('mouseup', this.stopDraggingNode);
    },

    whileDraggingNode(event) {
      const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
      const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

      this.updatePosition(this.id, x, y);

      this.x = x;
      this.y = y;
    },

    stopDraggingNode(event) {
      document.removeEventListener('mousemove', this.whileDraggingNode);
      document.removeEventListener('mouseup', this.stopDraggingNode);
      this.dragging = false;
    }
  }
};
