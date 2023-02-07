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
  import { useConnection } from '@/composables';
  import { useAppStore } from '@/stores/app';
  import { cellWidth } from '../../constants';
  import { EVENT } from '../../events';


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

    created() {
      const store = useAppStore();
      const { activeConnector } = useConnection(); // current connector

      watch(activeConnector, (connector /* , old */) => {
        if (connector.to.id) {
          this.active = false; // set to false once the connection is made
          // resetConnector() ?
          return;
        }

        const { port, id } = connector.from;

        this.from = store.getModule(id); // need x,y of this module (so connector stays linked to port)
        this.port = port;
        this.dragStart();
      });
    },

    methods: {
      dragStart() {
        this.cursorX = this.x = this.from.x + cellWidth + 3;  // line ends at cursor, which is initially the same point
        this.cursorY = this.y = this.from.y + (this.port * 20) + 27;
        this.active = true;

        document.addEventListener(EVENT.MOUSE_MOVE, this.drag);
        document.addEventListener(EVENT.MOUSE_UP, this.dragEnd);
      },

      /**
      * Update the connector's position.
      * @param  {Event} event The mousemove Event.
      * @return {Void}
      */
      drag(event) {
        this.cursorX = event.clientX +  0;// this.$store.state.app.canvasOffset;
        this.cursorY = event.clientY - 48;  // the header height

        event.stopPropagation();
      },

      /**
      * Finalize the connector's position.
      * @param  {Event} event: The mousemove Event.
      * @return {Void}
      */
      dragEnd(event) {
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('mouseup', this.dragEnd);

        this.active = false;
        this.cursorX = false;
        this.cursorY = false;
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
