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

<template>
  <line
    @click="removeConnection(id)"
    :x1="x1"
    :y1="y1"
    :x2="x2"
    :y2="y2"
    stroke="white"
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
      cursorY: false
    };
  },

  created() {
    this.fromModule = this.getModule(this.from.id);
    this.toModule = this.getModule(this.to.id);
    this.routeAudio();
  },

  destroyed() {
    this.routeAudio(false);
  },

  methods: {
    /**
     * Connect the actual AudioNode of the module. This is the meat-and-bones of
     * the App, so to speak.
     * @type {Boolean} connect Connect two nodes if true, disconnect if false.
     * @return {Void}
     */
    routeAudio(connect = true) {
      const source = this.fromModule.outlets[this.from.port].data;
      const destination = this.toModule.inlets[this.to.port].data;

      // mmm, maybe brittle.  AudioBuffer, AudioListener, AudioParam, ...etc
      // if (source instanceof window.AudioNode && destination instanceof window.AudioNode) {

      if (source && destination) {
        (connect) ? source.connect(destination) : source.disconnect(destination);
      } else {
        let inlet = this.toModule.inlets[0];
        let outlet = this.fromModule.outlets[0];

        try {
          if (outlet) console.log('src ', outlet.label, outlet.data);
          if (inlet) console.log('dest ', inlet.label, inlet.data.toString());
          console.log('audio routing failed. tried module #%d (port %s) --> module #%d (port %s)', this.from.id, this.from.port, this.to.id, this.to.port);
        } catch (e) {}
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
