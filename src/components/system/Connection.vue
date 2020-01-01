THE Connector provides a visual representation of the connection between two
modules (aka a line) as well as the audio connection information in each module.

The Connector will bind to each module's x,y coordinates to provide real-time
updates for each line endpoint. It will also bind the audio inputs / outputs
in each module, so that audio connections can be made.

In the Store, we have "to" and "from" info in the following format:

"to":{
  "id": 0,        // from this we derive the x,y coords (below)
  "port": 1       // from this, we derive y-offset coord, as well as the audioNode to connect to (in the Vue component, below)
}

"from":{
  "id": 1,
  "port": 1
}


With the above information, we can locate and bind a reference to the actual Vue component, ie:

"toModule": App.$children.find((c) => { c.id === to.id });
"fromModule": App.$children.find((c) => { c.id === from.id });

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
  import { mapGetters } from 'vuex';
  import { cellWidth } from '@/constants';
  import { Parameter } from '@/audio';

  export default {
    props: {
      id: Number,
      to: Object,   // { port, id }
      from: Object,  // { port, id }
    },

    computed: {
      x1() {
        return this.source.coords.x + cellWidth + 3;
      },
      y1() {
        return this.source.coords.y + (this.from.port * 20) + 27;
      },
      x2() {
        return this.dest.coords.x - 3;
      },
      y2() {
        return this.dest.coords.y + (this.to.port * 20) + 27;
      },

      /**
       * Calculate destination information
       *   - audio inlets
       *   - UI coords
       */
      dest() {
        const node = this.node(this.to.id); // audio stuffs
        // const module = this.module(this.to.id); // UI stuffs
        const module = this.to.id === 0 ? node : node.$parent; // UI stuffs

        return {
          name: node.type,
          coords: { x: module.x, y: module.y },
          node,
          // inlets: node.inlets,
        };
      },

      /**
       * Calculate source information
       *   - audio outlets
       *   - UI coords
       * @return {Node}
       */
      source() {
        const node = this.node(this.from.id); // audio stuffs
        // const module = this.module(this.from.id); // UI stuffs
        const module = node.$parent;

        return {
          name: node.type,
          coords: { x: module.x, y: module.y },
          node,
          // outlets: node.outlets,
        };
      },

      ...mapGetters([
        'node',    // audio
        // 'module',  // UI
      ])
    },

    data() {
      return {
        stroke: 'white'
      };
    },

    created() {
      this.route();
    },

    destroyed() {
      this.route(false);
      this.unwatch && this.unwatch();
    },

    methods: {
      /**
       * Connect the actual AudioNode of the module. This is the meat-and-bones of
       * the App, so to speak.
       * @type {Boolean} connect Connect two nodes if true, disconnect if false.
       * @return {Void}
       */
      route(connect = true) {
        const inlet = this.dest.node.inlets[this.to.port];
        const outlet = this.source.node.outlets[this.from.port];

        try {
          if (outlet.audio && inlet.audio) {
            // -------------------
            // AUDIO -> AUDIO
            // -------------------
            const source = outlet.audio;
            const destination = inlet.audio;

            (connect) ? source.connect(destination) : source.disconnect(destination);

            //
          } else if (outlet.data && inlet.audio) {
            // -------------------
            // DATA -> AUDIO
            // -------------------

            console.log('CONNECTION FROM DAT TO AUDIO ', this.from.id, this.to.id);
            const interpolator = new Parameter(0);



            this.source.node.$watch(outlet.data, interpolator.set);
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
              this.unwatch = this.source.node.$watch(action, update);
              // this.unwatch = this.$watch(action, update);
              this.stroke = '#999';
              // this.fromModule.$on(action, update);

            //
            }
          } else {
            const inType = inlet.data ? 'data' : inlet.audio ? 'audio' : 'unknown';
            const outType = outlet.data ? 'data' : outlet.audio ? 'audio' : 'unknown';

            this.stroke = 'red';

            // throw new Error('Connection: mismatch (' + outType + ' ⟹ ' + inType + ')');
            this.logError('Connection: mismatch (' + outType + ' ⟹ ' + inType + ')');
          }

          // success message:
          console.log('%c[connection] %s ⟹ %s', 'color: green', this.source.name, this.dest.name);
          //
        } catch (e) {
          this.logError(e);
          this.removeConnection();
        }
      },

      logError(e) {
        console.log('%c%s', 'color: red', e.toString().slice(0, 100));
        console.log('%c[error] connection: #%s.%d ⟹ #%s.%d', 'color: red',
          this.from.id, this.from.port + 1, this.to.id, this.to.port + 1);
      },

      removeConnection() {
        this.$store.commit('REMOVE_CONNECTION', this.id);
      },
    }
  };
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
