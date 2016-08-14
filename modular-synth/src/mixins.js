
let dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  startX: null,
  startY: null
};

/**
 * Draggable.
 * This mixin enables dragging of a Component. A position Object is updated in the Component's
 * data, and any/all connections to any inputs/outputs are also updated and redrawn.
 * @type {Object}
 */
import { updatePosition } from './vuex/actions';

export const draggable = {
  vuex: {
    actions: {
      updatePosition
    }
  },

  props: {
    x: 0,
    y: 0
  },

  data() {
    return {
      dragging: false
    };
  },

  computed: {
    position() {
      return {
        left: this.x + 'px',
        top: this.y + 'px'
      };
    }
  },

  methods: {
    startDraggingNode(event) {
      const node = this.$el;  // event.target;

      if (!event.target.classList.contains('module-interface')) {
        return;
      }

      this.dragging = true;

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = event.clientX; // + window.scrollX;
      dragObj.cursorStartY = event.clientY; // + window.scrollY;
      dragObj.startX = this.x || node.offsetLeft;
      dragObj.startY = this.y || node.offsetTop;

      // Update element's z-index.
      node.style.zIndex = ++dragObj.zIndex;

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingNode);
      document.addEventListener('mouseup', this.stopDraggingNode);
    },

    whileDraggingNode(event) {
      // var cursorX = event.clientX; // + window.scrollX;
      // var cursorY = event.clientY; // + window.scrollY;
      const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
      const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

      this.updatePosition(this.id, x, y);

      this.x = x;
      this.y = y;

      // update any lines that point in here.
      // this.updateConnections();
    },

    stopDraggingNode(event) {
      document.removeEventListener('mousemove', this.whileDraggingNode);
      document.removeEventListener('mouseup', this.stopDraggingNode);
      // updatePosition(this, x, y);
      // this.updateConnections();
      this.dragging = false;
    }
  }
};



//
// //
/* */
export const connectable = {
  data() {
    return {
      // fromModule: null,
      connections: []
    };
  },

  methods: {



    /**
     * Disconnect a node from all other nodes connecting to it, or that it connects to.
     * @param  {[type]} nodeElement [description]
     * @return {[type]}             [description]
     */
    disconnectNode(nodeElement) {
      var connections;
      var connector;
      var src;

      // for all nodes we connect to,
      if (nodeElement.outputConnections) {
        for (let i = 0; i < nodeElement.outputConnections.length; i++) {
          connector = nodeElement.outputConnections[i];
          // find each dstElement and remove us from the dst.inputConnections,
          connections = connector.destination.inputConnections;
          connections.splice(connections.indexOf(nodeElement), 1);
          // and delete the line
          connector.line.parentNode.removeChild(connector.line);
        }
        // empty our outputConnections
        nodeElement.outputConnections = null;
      }

      // then call disconnect() on our audioNode to clear all outbound connections
      // (this is what clear the audio connection, for all outbound connections at once)
      if (nodeElement.audioNode) { // we may not have an audioNode, if we're a BSN or an Oscillator
        nodeElement.audioNode.disconnect();
      }

      // for all nodes connecting to us - (aka in us.inputConnections)
      if (nodeElement.inputConnections) {
        for (let i = 0; i < nodeElement.inputConnections.length; i++) {
          connector = nodeElement.inputConnections[i];
          // this is trickier, because we'll have to destroy all their outbound connections.
          // TODO: this will suck for source nodes.
          src = connector.source;
          connections = src.outputConnections;
          // delete us from their .outputConnections,
          connections.splice(connections.indexOf(nodeElement), 1);

          if (src.audioNode) {  // they may not have an audioNode, if they're a BSN or an Oscillator
            // call disconnect() on the src,
            src.audioNode.disconnect();
            // if there's anything in their outputConnections, re.connect() those nodes.
            // TODO: again, this will break due to src resetting.
            for (let j = 0; j < connections.length; j++) {
              src.audioNode.connect(connections[i].destination.audioNode);
            }
          }

          // and delete the line
          connector.line.parentNode.removeChild(connector.line);
        }
        // empty inputConnections
        nodeElement.inputConnections = null;
      }
    },

    deleteConnection() {
      var connections = this.destination.inputConnections;

      var index = connections.indexOf(this.inputConnection);
      // this.breakSingleInputConnection(connections, connections.indexOf(this.inputConnection));
      // },

      // breakSingleInputConnection(connections, index) {
      var connector = connections[index];
      var src = connector.source;

      // delete us from their .outputConnections,
      src.outputConnections.splice(src.outputConnections.indexOf(connector.destination), 1);
      if (src.audioNode) {  // they may not have an audioNode, if they're a BSN or an Oscillator
        // call disconnect() on the src,
        src.audioNode.disconnect();
        // if there's anything left in their outputConnections, re.connect() those nodes.
        // TODO: again, this will break due to src resetting.
        for (let j = 0; j < src.outputConnections.length; j++) {
          src.audioNode.connect(src.outputConnections[j].destination.audioNode);
        }
      }

      // and delete the line
      connector.line.parentNode.removeChild(connector.line);

      // finally, remove us from the line.
      connections.splice(index, 1);
    }


  }
};
