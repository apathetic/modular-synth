THE Connector provides a visual representation of the connection between two
modules (aka a line) as well as the audio connection information in each module.

The Connector will bind to each module's x,y coordinates to provide real-time
updates for each line endpoint. It will also bind the audio inputs / outputs
in each module, so that audio connections can be made.

In the Store, we have "to" and "from" info in the following format:

"to":{
  "id": 0,
  "port": 1
}

"from":{
  "id": 1,
  "port": 1
}


With the above information, we can locate and bind a reference to the actual Vue component, ie:

"toModule": nodes.find((c) => { c.id === to.id });
"fromModule": nodes.find((c) => { c.id === from.id });

...while the "port" would direct us to the relevant in/out- let of the AudioNode to connect.

Other notes:
  * there can be multiple connections from an output.
  * there can only be a single connection to an input.
  * the connector will automatically set up audio routing between nodes when created


THOUGHTS:
* a connection may contain BOTH (or EITHER?) audio and CONTROL data. For example, a signal (audio),
  and a frequency (integer, data). This (the k-rate data) is used to visually display controls / drive
  other effects, etc.

<template>
  <line
    @click="removeConnection"
    :x1="x1"
    :y1="y1"
    :x2="x2"
    :y2="y2"
    :stroke="stroke"
    stroke-width="3">
  </line>
</template>


<script lang="ts">
  import { defineComponent, computed, ref, onUnmounted } from 'vue';
  import { useAppStore } from '@/stores/app';
  import { cellWidth } from '@/constants';
  import { wire, type WireResult } from '@/audio/routing';
  import { log } from '@/utils/logger';

  export default defineComponent({
    props: {
      id: Number,
      to: Object,
      from: Object,
      type: String, // "audio" | "data"
    },

    setup (props) {
      const { id, to, from } = props; // note: we destructure here b/c props dont need to be reactive in this component
      const store = useAppStore();
      const stroke = ref('white');

      if (!to || !from) {
        throw new Error('Connection: missing to/from');
      }

      const src = store.getRackUnit(from.id);
      const dest = store.getRackUnit(to.id);

      if (!src || !dest) {
        logError(new Error('Connection: rack unit not registered'));
        return;
      }

      const label = `${src.module.type}#${from.port + 1} ⟹ ${dest.module.type}#${to.port + 1}`;

      const x1 = computed(() => src.module.x + cellWidth + 3);
      const y1 = computed(() => src.module.y + (from.port * 20) + 27);
      const x2 = computed(() => dest.module.x - 3);
      const y2 = computed(() => dest.module.y + (to.port * 20) + 27);

      // All of the "connect these two web-audio nodes" logic lives in
      // @/audio/routing. Here we just wire it up, colour the line, and
      // remember how to tear it down.
      let handle: WireResult | undefined;
      try {
        handle = wire(
          { node: src.node,  port: from.port },
          { node: dest.node, port: to.port },
        );
        log({ type:'connection', action:'creating', data: `${label} (${handle.kind})` });

        if (handle.kind === 'data-data') {
          stroke.value = '#999';
        }
      } catch (e) {
        stroke.value = 'red';
        logError(e instanceof Error ? e : new Error(String(e)));
      }

      onUnmounted(() => {
        if (!handle) return;
        log({ type:'connection', action:'destroying', data: label });
        try {
          handle.unwire();
        } catch (e) {
          // Teardown errors shouldn't prevent component unmount.
          console.warn('[connection] unwire failed:', e);
        }
      });

      function removeConnection() {
        store.removeConnection(id);
      }

      function logError(e: Error) {
        console.log('%c%s', 'color: red', e.toString().slice(0, 100));
        console.log(`%c[error] connection`, 'color: red', JSON.stringify(to), JSON.stringify(from));

        // Bail whenever the connection fails. Removing the connection from
        // the patch unmounts this component, which triggers unwire().
        removeConnection();
      }

      return {
        stroke,
        removeConnection,
        x1,
        y1,
        x2,
        y2,
      };
    }
  });
</script>


<style lang="scss">
  svg {
    line {
      &:hover {
        stroke: lightblue;
      }
    }
  }
</style>
