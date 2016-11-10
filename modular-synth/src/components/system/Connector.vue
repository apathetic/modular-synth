THE Connector provides a visual representation of the connection between two
modules (aka a line). It also contains the relevant audio connection information:

* origin
  - module id
  - label
  - port
* destination
  - module id
  - label
  - port

The Connector will bind each module's x,y coordinates here, providing real-time
updates for each end of the line. It will also bind the audio inputs / outputs
in each module, so that audio connections can be made herein.

// From VUEX:
"from":{
  "id": 1,               // from this we derive the x,y coords
  // "label": "output-1",   // from this, we derive y-offset coord, as well as the audioNode to connect to
  "port": 1,            // from this, we derive y-offset coord, as well as the audioNode to connect to
}

Using the module id, we fetch and store a reference to the actual Vue module (i.e. not the JSON object
from the store).

Other notes:
  * there can be multiple connections from an output.
  * there can only be a single connection to an input.

<template>
  <line
    @click="removeConnection"
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
      modules: (state) => state.modules,   // only used to "reactify" new connections
      selected: (state) => state.selected
    }
  },

  props: {          // from the Store:
    id: Number,
    to: Object,     // module id, port #
    from: Object
  },

  data() {          // reference to actual modules in the App:
    return {
      fromModule: null,
      toModule: null,
      cursorX: false,
      cursorY: false
    };
  },

  computed: {
    x1() {
      return this.fromModule.x + cellWidth + 3;
    },
    y1() {
      return this.fromModule.y + (this.from.port * 20) + 27; // + 80;
    },
    x2() {
      return this.cursorX
             ? this.cursorX
             : this.toModule.x - 3;
    },
    y2() {
      return this.cursorY
             ? this.cursorY
             : this.toModule.y + (this.to.port * 20) + 27; // + 80;
    }
  },

  created() {
    this.fromModule = this.modules.find((m) => { return m.id === this.from.id; });

    // If created via clicking (ie. not via a load event), then one end is
    // being positioned by the user's cursor.
    if (!this.to.id) {
      this.cursorX = this.fromModule.x + cellWidth + 3;  // line ends at cursor, which is initially the same point
      this.cursorY = this.fromModule.y + (this.from.port * 20) + 27; // + 80;

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.dragEnd);
    } else {
      this.toModule = this.modules.find((m) => { m.id === this.to.id; });
    }
  },

  methods: {
    /**
     * THE MEAT AND BONES OF THE APP. HERE. THIS IS WHERE SHIT HAPPENS.
     */
    connect() {
      const source = this.fromModule.data;
      const destination = this.toModule.data;

      console.log(this.fromModule);
      console.log(this.toModule);

      // mmm, maybe brittle.  AudioBuffer, AudioListener, AudioParam, ...etc
      // if (source instanceof window.AudioNode && destination instanceof window.AudioNode) {

      if (source && destination) {
        console.log('routing %s --> %s', this.from.label, this.to.label);
        source.connect(destination);
      } else {
        console.log('audio routing failed. tried %s --> %s', this.from.label, this.to.label);
      }
    },

    /**
     * If the Connector is created via a "load" Event, references to a module's
     * x,y coordinates will be static, as will the reference to its audioNode.
     * Loop through these references and make sure they are updated and active.
     */
    reactify() {
      const modules = this.modules;    // universal getters perhaps handy here

      // bind visual connections
      this.toModule = modules.find(function(m) { return m.id === this.to.id; });
      this.fromModule = modules.find(function(m) { return m.id === this.from.id; });

      // and route ye olde audio
      this.connect();
    },

    /**
     * Update the connector's position.
     * @param  {Event} event: The mousemove Event.
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

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.dragEnd);

      if (target && target.classList.contains('inlet')) {           // TODO better check for this?
        const label = target.getAttribute('data-label');

        // gah. modules are JSON obj, *not* Vue components. also -- App.$children would
        // contain *all* vue components -- midi thing, svg lines, etc.
        const App = this.$parent;
        const module = App.$children.find(function(m) { return m.$el.contains(target); });
        const inlet = module.inlets.find(function(i) { return i.label === label; });
        // const to = Object.assign(inlet, { id: module.id });

        // this.to = to;
        // this.to.label = inlet.label;
        // this.to.port = inlet.port;
        // this.to.id = module.id;

        // we really only care about referencing the module (as it has x,y and audio)
        this.toModule = module;

        console.log(this.toModule.x);
        console.log(this.toModule.y);

        if (this.to.id === this.from.id) {
          this.removeConnection(this.id);     // remove is circular connection
        } else {
          // this.connect();
          this.updateConnection(this.id, inlet);    // update _state_ data in the store
          // this.updateConnection(this.id, to);
          console.log('modules', this.from, this.to);
        }
      } else {
        this.removeConnection(this.id);       // remove if connection wasn't made
      }

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
