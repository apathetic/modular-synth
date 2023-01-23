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


<script>
  import { defineComponent, computed, ref, toRefs, watch, onUnmounted } from 'vue';
  // import { mapState } from 'pinia';
  import { useAppStore } from '@/stores/app';
  import { cellWidth } from '@/constants';
  import { Parameter } from '@/audio';

  export default defineComponent({
    props: {
      id: Number,
      to: Object,
      from: Object,
    },

    setup (props) {
      // eslint-disable-next-line vue/no-setup-props-destructure
      const { id, to, from } = props;  // props dont need to be reactive in this component
      const store = useAppStore();
      const stroke = ref('white');

      const src = {
        node: store.getNode(from.id),
        module: store.getModule(from.id)
      };

      const dest = {
        node: store.getNode(to.id),
        module: store.getModule(to.id)
      };

      if (!src.node || !dest.node) {
        logError('node not registered');
        return;
      }

      const x1 = computed(() => src.module.x + cellWidth + 3);
      const y1 = computed(() => src.module.y + (from.port * 20) + 27);
      const x2 = computed(() => dest.module.x - 3);
      const y2 = computed(() => dest.module.y + (to.port * 20) + 27);


      /**
       * Connect the actual AudioNode of the module. This is the meat-and-bones of
       * the App, so to speak.
       * @type {Boolean} connect Connect two nodes if true, disconnect if false.
       * @return {Void}
       */
      function route(connect = true) {
        const inlet = dest.node.inlets[to.port];
        const outlet = src.node.outlets[from.port];

        try {
          if (outlet.audio && inlet.audio) {
            // -------------------
            // AUDIO -> AUDIO
            // -------------------
            const source = outlet.audio;
            const destination = inlet.audio;

            (connect) ? source.connect(destination) : source.disconnect(destination);

          } else if (outlet.data && inlet.audio) {
            // -------------------
            // DATA -> AUDIO
            // -------------------

            console.log('CONNECTION FROM DAT TO AUDIO ', from.id, to.id);
            const interpolator = new Parameter(0);



            src.node.$watch(outlet.data, interpolator.set);
            // this.$watch(outlet.data, interpolator.set);



            interpolator.output.connect(inlet.audio);

            //
          } else if (outlet.data && inlet.data) {
            // -------------------
            // DATA -> DATA
            // -------------------
            const action = outlet.data; // STRING
            const update = inlet.data;  // FUNCTION

            if (typeof update === 'function') {
              // "this.unwatch" is a fn that removes itself
              // "action" is a string -- is refers us to the property on source.node that should be watched;
              // ... when it is changed, the receiver function, "update" (on toModule), is fired with the new value.

              // this.unwatch = this.source.node.$watch(action, update);
              // const unwatch = watch(action, update);
              const unwatch = src.node.$watch(action, update); // watch the [action] prop on the node


              stroke.value = '#999';
              // this.fromModule.$on(action, update);

            //
            }
          } else {
            const destType = inlet.data ? 'data' : inlet.audio ? 'audio' : 'unknown';
            const outType = outlet.data ? 'data' : outlet.audio ? 'audio' : 'unknown';

            this.stroke = 'red';
            logError('Connection: mismatch (' + outType + ' ⟹ ' + destType + ')');
          }

          // success message:
          console.log('%c[connection] %s ⟹ %s', 'color: green', src.node.name, dest.node.name);

        } catch (e) {
          logError(e);
          removeConnection();
        }
      }

      function removeConnection() {
        store.removeConnection(id);
      }

      function logError(e) {
        console.log('%c%s', 'color: red', e.toString().slice(0, 100));
        console.log(
          '%c[error] connection: #%s.%d ⟹ #%s.%d', 'color: red',
          from.id, from.port + 1, to.id, to.port + 1
        );

        // bail whenever the connection fails.
        removeConnection();
      }

      onUnmounted(() => {
        route(false);
        this.unwatch && this.unwatch();
        console.log('removed', id);
      })

      route();

      return {
        stroke,
        removeConnection,
        x1,
        y1,
        x2,
        y2
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
