<template>
  <line class="dotted" v-if="active"
    :x1="x"
    :y1="y"
    :x2="cursorX"
    :y2="cursorY"
    stroke="white"
    stroke-dasharray="5, 5"
    stroke-width="3">
  </line>
</template>

<script>
import { watch } from 'vue';
import { cellWidth } from '../../constants';
import { EVENT } from '../../events';

import { useConnection } from '@/composables';


export default {
  data() {
    return {
      active: false,
      from: {},
      port: null,
      cursorX: false,
      cursorY: false
    };
  },

  /**
   *
   */
  created() {

    // this.$bus.$on('connection:start', (port, id) => {
    //   this.from = this.$store.getters.module(id);
    //   this.port = port;
    //   this.cursorX = this.x = this.from.x + cellWidth + 3;  // line ends at cursor, which is initially the same point
    //   this.cursorY = this.y = this.from.y + (this.port * 20) + 27;

    //   document.addEventListener(EVENT.MOUSE_MOVE, this.drag);
    //   document.addEventListener(EVENT.MOUSE_UP, this.dragEnd);

    //   this.active = true;
    // });

    const { activeConnector } = useConnection(); // current connector
    watch(activeConnector, ({ port, id }/* , old */) => {
      if (!connector) {
        this.active = false;
        return;
      }

      this.from = store.module(id);
      this.port = port;
      this.cursorX = this.x = this.from.x + cellWidth + 3;  // line ends at cursor, which is initially the same point
      this.cursorY = this.y = this.from.y + (this.port * 20) + 27;

      document.addEventListener(EVENT.MOUSE_MOVE, this.drag);
      document.addEventListener(EVENT.MOUSE_UP, this.dragEnd);

      this.active = true;

    });
  },

  methods: {
    /**
     * Update the connector's position.
     * @param  {Event} event The mousemove Event.
     * @return {Void}
     */
    drag(event) {
      this.cursorX = event.clientX + this.$store.state.app.canvasOffset;
      this.cursorY = event.clientY - 48;  // the header height

      event.stopPropagation();
    },

    /**
     * Finalize the connector's position.
     * @param  {Event} event: The mousemove Event.
     * @return {Void}
     */
    dragEnd(event) {
      const target = event.toElement || event.relatedTarget || event.target || false;
      const port = target.getAttribute('data-port');

      if (target && port) {                          // NOTE: port is a String, so "0" is cool here
        const focused = this.$store.getters.focused; // ironically, we dont even use the target to fetch the Component

        this.to = this.$store.getters.module(focused);

        if (
          this.to.id !== this.from.id &&            // if not circular connection
          this.isUnique()                           // is not a duplicated connection
        ) {
          this.$store.commit('ADD_CONNECTION', {
            to: {
              id: this.to.id,
              port: +port // parseInt(port)
            },
            from: {
              id: this.from.id,
              port: this.port
            }
          });
        }
      }

      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.dragEnd);

      this.active = false;
      this.cursorX = false;
      this.cursorY = false;
    },

    /**
     * Checks if a connection already exists between the start and end nodes.
     */
    isUnique() {
      return true; // TODO
    }
  }
};
</script>

<style lang="scss">
  .dotted {
    stroke-dasharray: 5;
    stroke-dashoffset: 5;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    from {
      stroke-dashoffset: 10;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
