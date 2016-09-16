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

  // computed: {
  //   position() {
  //     return {
  //       left: this.x + 'px',
  //       top: this.y + 'px'
  //     };
  //   }
  // },

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

      // console.log('start dragging');
      this.$dispatch('drag:start', [this.x, this.y], this.$el);

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDragging);
      document.addEventListener('mouseup', this.stopDragging);
    },

    whileDragging(event) {
      const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
      const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

      // console.log('dragging');
      this.updatePosition(this.id, x, y);
      this.$dispatch('drag:active', [x, y], this.$el);

      // this.x = x;  // we *could* set this on the node directly, since it's here, the coords are here... but, better to manage via the store
      // this.y = y;
    },

    stopDragging(event) {
      // console.log('stop dragging');
      this.$dispatch('drag:end');

      document.removeEventListener('mousemove', this.whileDragging);
      document.removeEventListener('mouseup', this.stopDragging);
      this.dragging = false;
    }
  }
};
