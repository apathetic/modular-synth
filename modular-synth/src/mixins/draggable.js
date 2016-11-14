/**
 * Draggable.
 * This mixin enables dragging of a Component. A position Object is updated in the Component's
 * data, and any/all connections to any inputs/outputs are also updated and redrawn.
 * @type {Object}
 */

import { updateGridPosition } from '../store/actions';

const dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  startX: null,
  startY: null
};

export const draggable = {
  vuex: {
    actions: {
      updateGridPosition
    },
    getters: {
      module: (state) => state.modules.find(function(module) { return module.id === this.id; })
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

  methods: {
    startDragging(event) {
      const node = this.$el;
      const x = node.offsetLeft;  // Calculate explicity because could be in play mode, in which
      const y = node.offsetTop;   // case x,y would not pertain to the actual node coords.

      node.style.zIndex = ++dragObj.zIndex;     // Update element's z-index.

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = event.clientX;
      dragObj.cursorStartY = event.clientY;
      dragObj.startX = x;
      dragObj.startY = y;

      this.x = x;
      this.y = y;
      this.dragging = true;
      this.$dispatch('drag:start', [x, y], this.$el);

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDragging);
      document.addEventListener('mouseup', this.stopDragging);
    },

    whileDragging(event) {
      const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
      const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

      this.x = x;
      this.y = y;

      this.$dispatch('drag:active', [x, y], this.$el);
      this.updateGridPosition(this.id, x, y);
    },

    stopDragging(event) {
      this.dragging = false;
      this.$dispatch('drag:end', this.id);

      // restore the x,y grid values on the node
      if (!this.$store.state.editing) {
        const module = this.$store.state.modules.find((module) => { return module.id === this.id; });

        this.x = module.x;
        this.y = module.y;
      }

      document.removeEventListener('mousemove', this.whileDragging);
      document.removeEventListener('mouseup', this.stopDragging);
    }
  }
};
