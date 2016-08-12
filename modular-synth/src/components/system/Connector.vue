THE Connector contains a visual representation of the connection between two
modules (aka a line). It also contains connection registration info:

* origin
  - module
  - outlet
  - port (element)
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
    @mouseover="highlight(1)"
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
      // position
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
      uid: 1234,

      cursorX: false,
      cursorY: false,
      // drawing: false

      stroke: 'black'

      // line: {
      //   stroke: 'black',
      //   x1: '',
      //   y1: '',
      //   x2: '',
      //   y2: ''
      // }
    };
  },

  // CONNECTOR
  // label:
  // module:
  // data:
  // port:
  // connections:

  /**
   * Draw a line when creating a new Connector.
   * @return {void}
   */
  created() {
    // let position = this.calculatePosition(this.from.module.$el);

    // let position = this.calculatePosition(this.from.port);
    // this.line.x1 = position.x;
    // this.line.y1 = position.y;
    // this.line.x2 = position.x;
    // this.line.y2 = position.y;

    // store a reference to this Connector in the origin's connections []
    // this.from.connections.push(this);
    // this.from.module.connections.push(this);

    // this.x2 = this.x1;  // line ends at cursor, which is initially the same point
    // this.y2 = this.y1;
    // this.cursorX = this.from.x;  // line ends at cursor, which is initially the same point
    // this.cursorY = this.from.y;

    // Capture mousemove and mouseup events on the page.
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('mouseup', this.dragEnd);
  },

  computed: {
    x1() {
      // return this.from.module.x; // + offset/port #
      const node = this.from.module;
      const width = node.width || 200;    // node.width is not in state.modules
      return node.x + width + 3;
    },
    y1() {
      const i = this.from.port || 0;
      return this.from.module.y + (i * 20) + 17 + 80;
    },

    x2() {
      return 123;
      // const width = 206; // ????
      // return this.cursorX
      //        ? this.cursorX
      //        : this.to.module.x + width + 3;
    },
    y2() {
      return 123;
      // return this.cursorY
      //        ? this.cursorY
      //        : this.to.module.y + (this.to.port * 20) + 17 + 80;
    }
  },

  methods: {
    /**
     * Update the connector's position.
     * @param  {Event} event: The mousemove Event.
     * @return {Void}
     */
    drag(event) {
      this._x2 = event.clientX;
      this._y2 = event.clientY;

      event.preventDefault();
      event.stopPropagation();
    },

    dragEnd(event) {
      console.log('dragend');
      const port = event.toElement || event.relatedTarget || event.target || false;

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.dragEnd);
      this.cursorX = false;
      this.cursorY = false;


      if (port && port.classList.contains('inlet')) {           // TODO better check for this?
        const label = port.getAttribute('data-label');

        // gah. modules are JS obj, *not* Vue components. ALso -- App.$children would
        // contain *all* vue components -- midi thing, svg lines, etc.
        // this.to.module = App.modules.find(function(module) {
        const App = this.$parent;      // required due to .... webpacking?
        const Mod = App.$children.find(function(m) { return m.$el.contains(port); });
        const inlet = Mod.inlets.find(function(i) { return i.label === label; });

        const module = this.active;

        // if (inlet.connections.length) {
        //   // do something
        // }


        // const position = this.calculatePosition(port);
        // this.x2 = position.x;
        // this.y2 = position.y;

        // this.computed.x2 = function() { return module.x + 200 + 3; }

        const to = {
          module: module,
          // port: = inlet.port,
          label: inlet.label
          // data: inlet.data
          // connections = inlet.connections;
        };
        this.updateConnection(this.id, to);


        // this.to.connections.push(this);
        this.$dispatch('connector:connect', this);
      } else {
        // Otherwise, delete the line
        // this.remove();
        this.removeConnection(this._uid);
      }
    },

    // remove() {
    //   // remove from src / dest node connections..???
    //
    //   // this.connections.splice(-1);
    //   this.$dispatch('connector:remove', this);
    //   this.$destroy(true);  // true is to remove the DOM (ie SVG line) element as well
    // },

    calculatePosition(el) {
      let BCR = el.getBoundingClientRect();
      let x = BCR.left;
      let y = BCR.top;

      x += 1 + BCR.width / 2;
      y += 1 + BCR.height / 2;

      return {
        x: x,
        y: y
      };
    },

    highlight(active) {
      this.stroke = active ? '#8888ff' : this.stroke;
    }
  }
};
</script>
