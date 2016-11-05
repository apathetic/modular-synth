THE Connector provides a visual representation of the connection between two
modules (aka a line). It also contains the relevant audio connection information:

* origin
  - module
  - outlet
  - (port?)
* destination
  - module
  - inlet
  - port

The Connector will bind each module's x,y coordinates here, providing real-time
updates for each end of the line. It will also bind the audio inputs / outputs
in each module, so that audio connections can be made herein.

// From VUEX:
"from":{
  "id": 1,               // from this we derive the x,y coords
  "label": "output-1",   // from this, we derive y-offset coord, as well as the audioNode to connect to
}

Using the module id, we bind the x,y coords and the audioNode to data props.

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
    :stroke="stroke"
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
    }
  },

  props: {
    id: Number,
    to: Object,
    from: Object
  },

  data() {
    return {
      cursorX: false,
      cursorY: false,
      stroke: 'white'
    };
  },

  computed: {
    x1() {
      const node = this.from.module;
      const width = cellWidth;

      return node.x + width + 3;
    },
    y1() {
      return this.from.module.y + (this.from.port * 20) + 27; // + 80;
    },
    x2() {
      return this.cursorX
             ? this.cursorX
             : this.to.module.x - 3;
    },
    y2() {
      return this.cursorY
             ? this.cursorY
             : this.to.module.y + (this.to.port * 20) + 27; // + 80;
    }
  },

  created() {
    // If created via clicking (ie. not via a load event), then one end is
    // being positioned by the user's cursor.
    if (!this.to.module) {
      this.cursorX = this.from.module.x + cellWidth + 3;  // line ends at cursor, which is initially the same point
      this.cursorY = this.from.module.y + (this.from.port * 20) + 27; // + 80;

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.drag);
      document.addEventListener('mouseup', this.dragEnd);
    }
  },

  methods: {
    /**
     * THE MEAT AND BONES OF THE APP. HERE. THIS IS WHERE SHIT HAPPENS.
     */
    connect() {
      console.log('connector: connect', this);
      if (this.to.module === this.from.module) {
        this.removeConnection(this.id);
      } else {
        const source = this.from.data;
        const destination = this.to.data;

        // const module = App.$children.find(function(m) { return m.$el.contains(outlet.port); });
        // const App = this.$parent;
        // const module = App.$children.find(function(m) { return m.id === connection.from.id; });
        // console.log(module);
        // debugger;


        if (source && destination) {
          console.log('connecting %s --> %s', this.from.label, this.to.label);
          source.connect(destination);
        } else {
          console.log('connector failed. tried %s --> %s', this.from.label, this.to.label);
        }
      }
    },

    /**
     * If the Connector is created via a "load" Event, references to a module's
     * x,y coordinates will be static, as will the reference to its audioNode.
     * Loop through these references and make sure they are updated and active.
     */
    reactify() {
      const modules = store.state.modules;    // universal getters perhaps handy here

      const source = this.from.data;
      const destination = this.to.data;
      const to = modules.find(function(m) { return m.id === this.to.module.id; });
      const from = modules.find(function(m) { return m.id === this.from.module.id; });

      // bind visual connections
      this.to.module = to;
      this.from.module = from;

      // mmm, maybe brittle.  AudioBuffer, AudioListener, AudioParam, ...etc
      if (source instanceof window.AudioNode && destination instanceof window.AudioNode) {
        this.connect();
      } else {
        console.log('connector: missing 1 or more audioNode');
      }
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

    dragEnd(event) {
      const port = event.toElement || event.relatedTarget || event.target || false;

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.dragEnd);

      if (port && port.classList.contains('inlet')) {           // TODO better check for this?
        const label = port.getAttribute('data-label');

        // gah. modules are JS obj, *not* Vue components. also -- App.$children would
        // contain *all* vue components -- midi thing, svg lines, etc.
        const App = this.$parent;
        const module = App.$children.find(function(m) { return m.$el.contains(port); });
        const inlet = module.inlets.find(function(i) { return i.label === label; });

        this.updateConnection(this.id, inlet);
      } else {
        // Otherwise, delete the line
        this.removeConnection(this.id);
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
