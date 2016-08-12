THE Connector contains a visual representation of the connection between two
modules (aka a line). It also contains connection registration info:

* origin
  - module
  - outlet
  - port (#)
* destination
  - module
  - inlet
  - port


Other notes:
  * there can be multiple connections from an output.
  * there can only be a single connection to an input.

<template>
  <line
    @click="removeConnection"
    @mouseover="highlight"
    :x1="x1"
    :y1="y1"
    :x2="x2"
    :y2="y2"
    :stroke="stroke"
    stroke-width="4">
  </line>
</template>

<script>
import { updateConnection, removeConnection } from '../../vuex/actions';

export default {
  vuex: {
    getters: {
      active: (state) => state.modules[state.active]
    },
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
      // uid: 1234,
      cursorX: false,
      cursorY: false,
      stroke: 'black'
    };
  },

  created() {
    this.cursorX = this.from.module.x + 200 + 3;  // line ends at cursor, which is initially the same point
    this.cursorY = this.from.module.y + (0 * 20) + 17 + 80;

    // Capture mousemove and mouseup events on the page.
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('mouseup', this.dragEnd);
  },

  computed: {
    x1() {
      const node = this.from.module;
      const width = node.width || 200;    // node.width is not in state.modules
      return node.x + width + 3;
    },
    y1() {
      const i = this.from.port || 0;
      return this.from.module.y + (i * 20) + 17 + 80;
    },

    x2() {
      return this.cursorX
             ? this.cursorX
             : this.to.module.x;
    },
    y2() {
      const i = 0; // this.to.port;
      return this.cursorY
             ? this.cursorY
             : this.to.module.y + (i * 20) + 17 + 80;
    }
  },

  methods: {
    /**
     * Update the connector's position.
     * @param  {Event} event: The mousemove Event.
     * @return {Void}
     */
    drag(event) {
      this.cursorX = event.clientX;
      this.cursorY = event.clientY;

      event.preventDefault();
      event.stopPropagation();
    },

    dragEnd(event) {
      console.log('dragend');
      const port = event.toElement || event.relatedTarget || event.target || false;

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.dragEnd);

      if (port && port.classList.contains('inlet')) {           // TODO better check for this?
        const label = port.getAttribute('data-label');

        // gah. modules are JS obj, *not* Vue components. ALso -- App.$children would
        // contain *all* vue components -- midi thing, svg lines, etc.
        // this.to.module = App.modules.find(function(module) {
        const App = this.$parent;      // required due to .... webpacking?
        const Mod = App.$children.find(function(m) { return m.$el.contains(port); });
        const inlet = Mod.inlets.find(function(i) { return i.label === label; });

        /* */
        // const module = this.active;
        // const to = {
        //   module: module,
        //   port: inlet.port,
        //   label: inlet.label,
        //   data: inlet.data
        // };
        // // this.to = to;
        // console.log('ignore this:', to);
        // /* */
        //
        //

        this.updateConnection(this.id, inlet);

        //
        //
      } else {
        // Otherwise, delete the line
        this.removeConnection(this._uid);
      }

      this.cursorX = false;
      this.cursorY = false;
    },

    highlight(active = true) {
      this.stroke = active ? '#8888ff' : this.stroke;
    }
  }
};
</script>
