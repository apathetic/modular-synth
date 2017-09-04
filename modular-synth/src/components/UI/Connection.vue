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
import { mapActions } from 'vuex';

export default {
  props: {
    id: Number,
    to: Object,
    from: Object
  },

  computed: {
    x1() {
      return this.fromModule.x + cellWidth + 3;
    },
    y1() {
      return this.fromModule.y + (this.from.port * 20) + 27;
    },
    x2() {
      return this.toModule.x - 3;
    },
    y2() {
      return this.toModule.y + (this.to.port * 20) + 27;
    }
  },

  data() {                // reference to actual modules in the App:
    return {
      fromModule: {},     // will be a Vue Component
      toModule: {},       // will be a Vue Component
      cursorX: false,
      cursorY: false,
      stroke: 'white'
    };
  },

  created() {
    this.fromModule = this.getModule(this.from.id);
    this.toModule = this.getModule(this.to.id);
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
      const outlet = this.fromModule.outlets[this.from.port];
      const inlet = this.toModule.inlets[this.to.port];

      if (inlet && outlet) {
        if (inlet.audio && outlet.audio) {
          //
          // AUDIO
          //
          try {
            const source = outlet.audio;
            const destination = inlet.audio;

            (connect) ? source.connect(destination) : source.disconnect(destination);

            console.log('%c • %s ⟹ %s', 'color: green', this.fromModule.name, this.toModule.name);
          } catch (e) {
            console.log('%c[error] audio dis/connect: id %s (#%d) ⟹ id %s (#%d)', 'color: red', this.from.id, this.from.port, this.to.id, this.to.port);
            console.log(e);
          }
        } else if (inlet.hasOwnProperty('data') && outlet.hasOwnProperty('data')) {
          //
          // DATA
          //
          try {
            const action = outlet.data; // STRING
            const update = inlet.data;  // FUNCTION

            if (typeof update === 'function') {
              console.log('erd');
              // unwatch is a fn that removes itself
              // "sender" is a string -- is refers us to the property on fromModule that should be watched;
              // ... when it is changed, the receiver function (on toModule) is fired with the new value.
              this.unwatch = this.fromModule.$watch(action, update);
              this.stroke = '#999';
              // this.fromModule.$on(action, update);
            }
          } catch (e) {
            console.log('connect fail', e);
          }

          //
        } else {
          const type = outlet.data ? 'data' : outlet.audio ? 'audio' : 'unknown';
          console.error('Connection error: type mismatch (or undefined). From id %s #%d (%s)', this.from.id, this.from.port, type);
        }
      }
    },

    /**
     * Fetch a Vue Component from the App, given a particular id. Fetch the currently
     * focused Component if no id is passed in.
     * NOTE: we fetch the Component from the App (not the Store), as that is what
     *       contains the actual AudioNode.
     * @type {Number} id The id of the module to fetch.
     */
    getModule(id) {
      const App = this.$parent;

      return App.$children.find((m) => { return m.id === id; });
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
