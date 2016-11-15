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

<template>
  <line
    @click="removeConnection(this.id)"
    :x1="x1"
    :y1="y1"
    :x2="x2"
    :y2="y2"
    stroke="white"
    stroke-width="3">
  </line>
</template>

<script>
import { updateConnection, removeConnection } from '../../store/actions';
import { cellWidth } from '../../dimensions';

export default {
  vuex: {
    actions: {
      updateConnection,
      removeConnection
    },
    getters: {
      // modules: (state) => state.modules,   // only used to "reactify" new connections
      selected: (state) => state.selected
    }
  },

  props: {                // data from the Store
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
      return this.cursorX
             ? this.cursorX
             : this.toModule.x - 3;
    },
    y2() {
      return this.cursorY
             ? this.cursorY
             : this.toModule.y + (this.to.port * 20) + 27;
    }
  },

  data() {                // reference to actual modules in the App:
    return {
      fromModule: {},     // will be a Vue Component
      toModule: {},       // will be a Vue Component
      // source: null,
      // destination: null,
      cursorX: false,
      cursorY: false
    };
  },

  created() {
    this.fromModule = this.getModule(this.from.id);
    // this.source = this.fromModule.outlets[this.from.port].data;

    // If created via clicking (ie. not via a load event), then one
    // end is currently being positioned by the user's cursor.
    if (typeof this.to.id !== 'number') {
      this.cursorX = this.fromModule.x + cellWidth + 3;  // line ends at cursor, which is initially the same point
      this.cursorY = this.fromModule.y + (this.from.port * 20) + 27;

      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.dragEnd);
    } else {
      this.toModule = this.getModule(this.to.id);
      this.routeAudio();
      // this.destination = this.toModule.inlets[this.to.port].data;
    }
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
        console.log('audio routing failed. tried module #%d (port %s) --> module #%d (port %s)', this.from.id, this.from.port, this.to.id, this.to.port);
      }
    },

    /**
     * Fetch a Vue Component from the App, given a particular id. Fetch the currently
     * selected Component if no id is passed in.
     * @type {Number} id The id of the module to fetch.
     */
    getModule(id = this.selected) {   // this.$store.selected
      const App = this.$parent;
      return App.$children.find((m) => { return m.id === id; });
    },

    /**
     * Update the connector's position.
     * @param  {Event} event The mousemove Event.
     * @return {Void}
     */
    drag(event) {
      this.cursorX = event.clientX;
      this.cursorY = event.clientY - 54;  // the header height

      event.preventDefault();
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

      if (target && port) {
        this.toModule = this.getModule();         // ironically, we dont even use the target to fetch the Component
        this.to.id = this.toModule.id;
        this.to.port = port;
        this.updateConnection(this.id, parseInt(port));     // update _state_ data in the store.

        if (this.to.id === this.from.id) {
          this.removeConnection(this.id);         // remove if circular connection
        } else {
          this.routeAudio();
        }
      } else {
        this.removeConnection(this.id);           // remove if connection wasn't made
      }

      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.dragEnd);

      this.cursorX = false;
      this.cursorY = false;
    }
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
