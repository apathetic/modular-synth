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


<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { useConnection } from '@/composables';
  import { useAppStore } from '@/stores/app';
  import { cellWidth } from '@/constants';
  import type { Module, RackUnit } from '@/types';

  export default defineComponent({
    setup () {
      const store = useAppStore();
      const { activeConnector, resetConnector } = useConnection(); // current connector
      const active = ref(false);
      const cursorX = ref();
      const cursorY = ref();
      const x = ref();
      const y = ref();

      watch(activeConnector, (connector /* , old */) => {
        if (connector.to.id) {
          active.value = false; // set to false once the connection is made
          // resetConnector() ?
          return;
        }

        const { port, id } = connector.from;
        const { module } = store.getRackUnit(id); // need x,y of this module (so connector stays linked to port)

        if (!module || port === undefined) return;
        dragStart(module, port);
      });

      /**
       * Starts drawing a new connection.
       * @param {Module} from The originating module
       * @param {number} port The port of the originating module
       */
      function dragStart(from: Module, port: number) {
        cursorX.value = x.value = from.x + cellWidth + 3;  // line ends at cursor, which is initially the same point
        cursorY.value = y.value = from.y + (port * 20) + 27;
        active.value = true;

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
      }

      /**
       * Update the connector's position.
       * @param {MouseEvent} event The mousemove Event.
       */
      function drag(event: MouseEvent) {
        event.stopPropagation();
        cursorX.value = event.clientX +  0; // this.$store.state.app.canvasOffset;
        cursorY.value = event.clientY - 48; // the header height
      }

      /**
       * Finalize the connector's position.
       */
      function dragEnd() {
        active.value = false;
        cursorX.value = false;
        cursorY.value = false;

        // resetConnector();
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', dragEnd);
      }

      return {
        active,
        cursorX,
        cursorY,
        x,
        y,
      };
    }
  });
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
