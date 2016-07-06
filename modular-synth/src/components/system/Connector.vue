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
    @click="remove"
    :x1="line.x1"
    :y1="line.y1"
    :x2="line.x2"
    :y2="line.y2"
    :stroke="line.stroke"
    stroke-width="2">
  </line>
</template>

<script>
export default {
  props: {
    to: Object,
    from: Object
  },

  data() {
    return {
      uid: 1234,

      line: {
        stroke: 'black',
        x1: '',
        y1: '',
        x2: '',
        y2: ''
      }
    };
  },

  // CONNECTOR
  // label:
  // module:
  // data:
  // port:
  // connections:

  ready() {
    let position = this.calculatePosition(this.from.port);

    this.line.x1 = position.x;
    this.line.y1 = position.y;
    this.line.x2 = position.x;
    this.line.y2 = position.y;

    // store a reference to this Connector in the origin's connections []
    this.from.connections.push(this);
    // this.from.module.connections.push(this);

    // Capture mousemove and mouseup events on the page.
    document.addEventListener('mousemove', this.drag);
    document.addEventListener('mouseup', this.dragEnd);
  },

  methods: {
    /**
     * Update the connector's position.
     * @param  {Event} event: The mousemove Event.
     * @return {Void}
     */
    drag(event) {
      this.line.x2 = event.clientX;
      this.line.y2 = event.clientY;

      event.preventDefault();
      event.stopPropagation();
    },

    dragEnd(event) {
      console.log('dragend');
      const App = this.$parent;      // required due to .... webpacking?
      const port = event.toElement || event.relatedTarget || event.target || false;

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.drag);
      document.removeEventListener('mouseup', this.dragEnd);

      if (port && port.classList.contains('inlet')) {           // TODO better check for this?
        let label = port.getAttribute('data-label');
        let position = this.calculatePosition(port);
        // gah. modules are JS obj, *not* Vue components. ALso -- App.$children would
        // contain *all* vue components -- midi thing, svg lines, etc.
        // this.to.module = App.modules.find(function(module) {
        let module = App.$children.find(function(m) { return m.$el.contains(port); });
        let inlet = module.inlets.find(function(i) { return i.label === label; });

        if (inlet.connections.length) {
          // do something
        }

        this.line.x2 = position.x;
        this.line.y2 = position.y;

        this.to.label = label;
        this.to.module = module;
        this.to.data = inlet.data;
        this.to.port = port;
        this.to.connections = inlet.connections;

        this.to.connections.push(this);

        this.$dispatch('connector:connect', this);
      } else {
        // Otherwise, delete the line
        this.remove();
      }
    },

    remove() {
      // remove from src / dest node connections..???

      // this.connections.splice(-1);
      this.$dispatch('connector:remove', this);
      this.$destroy(true);  // true is to remove the DOM (ie SVG line) element as well
    },

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

    highlight() {
      this.stroke = '#8888ff';
    }
  }
};
</script>

