
var dragObj = {
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

  data() {
    return {
      x: 0,
      y: 0,
      // position: {
      //   top: 0,
      //   left: 0
      // },
      dragging: false
    };
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

      // console.log(this.id, this._uid);
      this.updatePosition(this.id, x, y);

      this.x = x;
      this.y = y;

      // update any lines that point in here.
      this.updateConnections();
    },

    stopDraggingNode(event) {
      document.removeEventListener('mousemove', this.whileDraggingNode);
      document.removeEventListener('mouseup', this.stopDraggingNode);
      // updatePosition(this, x, y);
      this.updateConnections();
      this.dragging = false;
    },

    //

    //

    // update any connections.
    // TODO: the Connector contains a ref to both src and dest modules.
    // Rather than store (duplicate) references to the Connector within
    // each of those modules, is it not better to allow the Connector
    // to update itself?  However, how to broadcast / notify Connector
    // of a module's position updates?
    updateConnections() {
      let node = this;

      if (node.inlets) {
        node.inlets.forEach(function(inlet, i) {
          inlet.connections.forEach(function(connector) {
            connector.line.x2 = node.x - 3;
            connector.line.y2 = node.y + (i * 20) + 17 + 80;  // if the inlets always maintain the same spacing...
          });
        });
      }

      if (node.outlets) {
        node.outlets.forEach(function(outlet, i) {
          outlet.connections.forEach(function(connector) {
            connector.line.x1 = node.x + node.width + 3;
            connector.line.y1 = node.y + (i * 20) + 17 + 80;
          });
        });
      }


      // this.connections.forEach(function(connector) {
      //   let BCR = connector.from.port.getBoundingClientRect();
      //   connector.line.x1 = BCR.left + 3;   // 3 is half the port width, of 5
      //   connector.line.y1 = BCR.top.y + 7;  // 7 is half the port height, of 14
      // });
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


    //

    // updateConnections(node) {
    //   node.inlets.forEach(function(inlet) {
    //     inlet.connections.forEach(function(line) {
    //       line.x2 = inlet.x;
    //       line.y2 = inlet.y;
    //     });
    //   });

    //   node.outlets.forEach(function(outlet) {
    //     //   input.line.x1 = input.x;
    //     //   input.line.y1 = input.y;
    //     if (outlet.connections.length) {
    //       // console.log(outlet.connections);
    //     }
    //   });
    // },

    //

    deleteConnection() {
      // from 3nodes:
      /*    # Unregister the connection from the fields
          @from_field.unregisterConnection(this)
          @to_field.unregisterConnection(this)
          @to_field.removeConnections()

          # Set the "to" node dirty so it is reprocessed next time
          @to_field.node.dirty = true
          @to_field.changed = true

          # Delete variable reference for garbage collection
          delete @from_field
          delete @to_field

          # Trigger the removed event and call destroy()
          @trigger "connection:removed", this
          @destroy()

      */


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
