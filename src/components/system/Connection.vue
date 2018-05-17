THE Connector provides a visual representation of the connection between two
modules (aka a line) as well as the audio connection information in each module.

Required (to/from):
audioNode
port
x
y


The Connector will bind to each module's x,y coordinates to provide real-time
updates for each end of the line. It will also bind the audio inputs / outputs
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
    @click="removeConnection(id)"
    :x1="x1"
    :y1="y1"
    :x2="x2"
    :y2="y2"
    :stroke="stroke"
    stroke-width="3">
  </line>
</template>

<script>
  import { cellWidth } from '../../dimensions';
  import { Parameter } from '../../audio';
  import { mapActions } from 'vuex';

  export default {
    props: {
      id: Number,
      to: Object,   // { port, id }
      from: Object  // { port, id }

      // inlet: Object,  // { port, id }
      // outlet: Object  // { port, id }
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
      }
    },

    data() {
      return {
        stroke: 'white'

        // For reference (this doesn't need to be reactive):
        // source: {
        //   outlet: null,
        //   module: null,
        //   id: null
        // }
      };
    },

    created() {
      this.getToAndFromModules();
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
        // const outlet = this.source.outlet;
        // const inlet = this.dest.inlet;
        const outlet = this.source.module.outlets[this.from.port];
        const inlet = this.dest.module.inlets[this.to.port];

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

            this.source.module.$watch(outlet.data, interpolator.set);
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
              // "action" is a string -- is refers us to the property on source.module that should be watched;
              // ... when it is changed, the receiver function, "update" (on toModule), is fired with the new value.
              this.unwatch = this.source.module.$watch(action, update);
              this.stroke = '#999';
              // this.fromModule.$on(action, update);

            //
            }
          } else {
            const inType = inlet.data ? 'data' : inlet.audio ? 'audio' : 'unknown';
            const outType = outlet.data ? 'data' : outlet.audio ? 'audio' : 'unknown';

            this.stroke = 'red';

            throw '[error] connection: mismatch (' + outType + ' ⟹ ' + inType + ')';  // eslint-disable-line
          }

          // success message:
          console.log('%c[connection] %s ⟹ %s', 'color: green', this.source.module.name, this.dest.module.name);
          //
        } catch (e) {
          this.logError(e);
        }
      },

      /**
       * Fetch a Vue Component from the App, given a particular id.
       * NOTE: we fetch the Component from the App (not the Store), as that is what
       *       contains the actual AudioNode.
       * @type {Number} id The id of the module to fetch.
       */
      getToAndFromModules() {
        try {
          const modules = this.$parent.$children;
          const from = modules.find((m) => { return m.id === this.from.id; });
          const to = modules.find((m) => { return m.id === this.to.id; });

          this.dest = {
            coords: to,
            module: this.to.id === 0 ? to : to.$children[0],
            id: this.to.id
          };

          this.source = {
            coords: from,
            module: from.$children[0],
            id: this.from.id
          };
        } catch (e) {
          this.logError(e);
        }
      },

      logError(e) {
        console.log('%c%s', 'color: red', e.toString().slice(0, 100));
        console.log('%c[error] connection: #%s.%d ⟹ #%s.%d', 'color: red', this.from.id, this.from.port + 1, this.to.id, this.to.port + 1);
      },

      // VUEX actions, bound as local methods:
      ...mapActions([
        'removeConnection'
      ])
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