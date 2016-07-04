
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
export const draggable = {
  data() {
    return {
      x: 0,
      y: 0,
      position: {
        top: 0,
        left: 0
      },
      dragging: false
    };
  },

  methods: {

    // BIND directly to on* methods? (ie. a la dragabilly):
    // el.pointerDown
    // el.pointerMove
    // el.pointerUp

    startDraggingNode(event) {
      var el = this.$el;  // event.target;

      // this.startPoint = { x: 0, y: 0 };
      // this.dragPoint = { x: 0, y: 0 };

      this.dragging = true;

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = event.clientX; // + window.scrollX;
      dragObj.cursorStartY = event.clientY; // + window.scrollY;
      dragObj.startX = el.offsetLeft || 0; // el.getBoundingClientRect().left; //
      dragObj.startY = el.offsetTop || 0; // el.getBoundingClientRect().top;  //

      // Update element's z-index.
      el.style.zIndex = ++dragObj.zIndex;

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingNode);
      document.addEventListener('mouseup', this.stopDraggingNode);

      event.preventDefault();
    },

    whileDraggingNode(event) {
      // var off;
      // var el = this.$el; // dragObj.elNode;
      var cursorX = event.clientX; // + window.scrollX;
      var cursorY = event.clientY; // + window.scrollY;
      let x = dragObj.startX + cursorX - dragObj.cursorStartX;
      let y = dragObj.startY + cursorY - dragObj.cursorStartY;

      this.x = x;
      this.y = y;
      this.position.left = x + 'px';
      this.position.top = y + 'px';

      // update any lines that point in here.
      this.updateConnections(this);
      /*
      this.$dispatch('connection:update', this);
      if (1) return;

      // update any lines that point in here.
      let inputs = this.connections.in;
      inputs.forEach(function(input) {
        let x = input.port.getBoundingClientRect().left;
        let y = input.port.getBoundingClientRect().top;
        input.line.x1 = x;
        input.line.y1 = y;
      });

      // if (el.outputConnections) {  // update any lines that point out of herel.
      //   off = el.outputs;
      //   x = window.scrollX + 12;
      //   y = window.scrollY + 12;

      //   while (off) {
      //     x += off.offsetLeft;
      //     y += off.offsetTop;
      //     off = off.offsetParent;
      //   }

      //   for (let c = 0; c < el.outputConnections.length; c++) {
      //     el.outputConnections[c].line.setAttributeNS(null, 'x2', x);
      //     el.outputConnections[c].line.setAttributeNS(null, 'y2', y);
      //   }
      // }

      event.preventDefault();
      */
    },

    // update any lines that point in here.
    updateConnections(node) {
      node.inlets.forEach(function(inlet) {
        inlet.connections.forEach(function(line, i) {
          // line.x2 = inlet.x;
          // line.y2 = inlet.y;
          line.x2 = node.x - 3;
          line.y2 = node.y + (i * 20) + 17 + 80;  // if the inlets always maintain the same spacing...
        });
      });

      node.outlets.forEach(function(outlet) {
        outlet.connections.forEach(function(line, i) {
          line.x1 = node.x + node.width + 3;
          line.y1 = node.y + (i * 20) + 17 + 80;
        });
      });
    },

    stopDraggingNode(event) {
      document.removeEventListener('mousemove', this.whileDraggingNode);
      document.removeEventListener('mouseup', this.stopDraggingNode);
      this.updateConnections(this);
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
    // JS object containing label, data (audio or control), + active connections
    startDraggingConnector(event, connector) {
      let port = event.target;    // visual nub that was clicked in the UI
      // let connector = connector;
      // let module = this; // TODO rename node --> module
      let x;
      let y;
      let BCR = port.getBoundingClientRect();

      // this.fromModule = this;

      // Get the position of the originating connector with respect to the page.
      x = BCR.left;
      y = BCR.top;
      x += BCR.width / 2 + 1;
      y += BCR.height / 2 + 1;

      // Save starting positions of cursor.
      // dragObj.cursorStartX = x;
      // dragObj.cursorStartY = y;

      let line = {
        x1: x,
        y1: y,
        x2: x,
        y2: y
      };

      // add a VISUAL representation of the connection to the canvas
      // this.connections.push(line);  // connections is in App AND the module
      // we need a way to get the canvas in App to update w/ new visual line
      this.$dispatch('connection:add', line);


      dragObj.line = line;

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingConnector);
      document.addEventListener('mouseup', this.stopDraggingConnector);
      // this.$els.module.addEventListener('mousemove', this.whileDraggingConnector);
      // this.$els.module.addEventListener('mouseup', this.stopDraggingConnector);
    },

    /**
     * Update the connector's position.
     * @param  {Event} event: The mousemove Event.
     * @return {Void}
     */
    whileDraggingConnector(event) {
      let x = event.clientX;
      let y = event.clientY;

      // Move connector visual line
      dragObj.line.x2 = x;
      dragObj.line.y2 = y;

      event.preventDefault();
      event.stopPropagation();
    },

    stopDraggingConnector(event, a, b, c) {
      const App = this.$parent;      // required due to .... webpacking?
      const port = event.toElement || event.relatedTarget || event.target || false;
      // let input = 'input';  // port.getAttribute('data-connects');
      let x;
      let y;
      let BCR = port.getBoundingClientRect();

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.whileDraggingConnector); // .bind(this)
      document.removeEventListener('mouseup', this.stopDraggingConnector);    // .bind(this)

      // TODO better check for this?
      if (port.classList.contains('input')) {
        // TODO
        // find the module that contains the inlet we want to connect to
        let destination = App.modules.find(function(node) {
          return node.$el.contains(port);
        });

        x = BCR.left;
        y = BCR.top;
        x += 1 + BCR.width / 2;   // TODO move into computed props
        y += 1 + BCR.height / 2;

        dragObj.line.x2 = x;
        dragObj.line.y2 = y;

        // let sourceNode = dragObj.source.node;   = this;
        let inletLabel = port.getAttribute('data-label');
        let inlet = destination.inlets.find(function(inlet) { return inlet.label === inletLabel; });

        this.connect(destination, inlet);
        //
      } else {
        // Otherwise, delete the line
        this.connections.splice(-1);
      }
    },

    /**
     * Connect two Audio Nodes
     * @param  {Vue Component} sourceNode: The source Vue Component / Audio Node
     * @param  {Object} outlet: the outlet to connect from.
     * @param  {Vue Component} destNode: The destination Vue Component / Audio Node
     * @param  {String} inletName: the name of the inlet to connect in
     * @return {Void}
     */
    connect(destNode, inlet) {
      let sourceNode = this;
      let outlet = dragObj.source.outlet;
      let line = dragObj.line;
      let audioOut = sourceNode[outlet.label] || false;
      let audioIn = destNode[inlet.label] || false;

      console.log('connecting output %s from %s to input %s in %s', outlet.label, sourceNode.id, inlet.label, destNode.id);

      // visual
      outlet.connections.push(line);
      inlet.connections.push(line);

      // functional
      if (audioOut && audioIn) {
        audioOut.connect(audioIn);
      }
    },

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

    //

    //

    //

    //

    //

    //

    //

    //

    // whileDraggingConnector(event) {
    //   var x, y;
    //   var toElem = event.toElement;

    //   // Get cursor position with respect to the page.
    //   x = event.clientX + window.scrollX;
    //   y = event.clientY + window.scrollY;

    //   // Move connector visual line
    //   dragObj.connectorShape.setAttributeNS(null, 'x2', x);
    //   dragObj.connectorShape.setAttributeNS(null, 'y2', y);

    //   // If this is a text node, use its parent element.
    //   if (toElem.nodeType === 3) {
    //     toElem = toElem.parentNode;
    //   }

    //   if (toElem.classList) { // if we don't have class, we're not a node.
    //     // if this is the green or red button, use its parent.
    //     if (toElem.classList.contains('node-button')) {
    //       toElem = toElem.parentNode;
    //     }

    //     // if we're over our originating node, do nothing.
    //     if (toElem === dragObj.elemNode) {
    //       return;
    //     }

    //     // If we used to be lighting up a node, but we're not over it anymore,
    //     // unlight it.
    //     if (dragObj.lastLit && (dragObj.lastLit !== toElem)) {
    //       dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
    //       dragObj.lastLit = null;
    //     }

    //     // light up connector point underneath, if any
    //     if (toElem.classList.contains('node')) {
    //       if (!dragObj.lastLit || (dragObj.lastLit !== toElem)) {
    //         if (dragObj.originIsInput) {
    //           if (toElem.classList.contains('node-output')) {
    //             toElem.unlitClassname = toElem.className;
    //             toElem.className += ' canConnect';
    //             dragObj.lastLit = toElem;
    //           }
    //         } else {  // first node was an output, so we're looking for an input
    //           if (toElem.classList.contains('node-input')) {
    //             toElem.unlitClassname = toElem.className;
    //             toElem.className += ' canConnect';
    //             dragObj.lastLit = toElem;
    //           }
    //         }
    //       }
    //     }
    //   }

    //   event.preventDefault();
    //   event.stopPropagation();
    // },

    // stopDraggingConnector(event) {
    //   var x;
    //   var y;
    //   var off;
    //   var toElem;

    //   // Stop capturing mousemove and mouseup events.
    //   document.removeEventListener('mousemove', this.whileDraggingConnector); // .bind(this)
    //   document.removeEventListener('mouseup', this.stopDraggingConnector);    // .bind(this)

    //   if (dragObj.lastLit) {
    //     dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
    //     dragObj.lastLit = null;
    //   }

    //   dragObj.elNode.className = dragObj.elNode.unlitClassname;

    //   toElem = event.toElement || event.target;

    //   // If this is a text node, use its parent element.
    //   if (toElem.nodeType === 3) {
    //     toElem = toElem.parentNode;
    //   }

    //    // if we don't have class, we're not a node.
    //   if (toElem.classList) {
    //     // if this is the green or red button, use its parent.
    //     if (toElem.classList.contains('node-button')) {
    //       toElem = toElem.parentNode;
    //     }

    //     // Get the position of the originating connector with respect to the page.
    //     off = toElem;
    //     x = window.scrollX + 12;
    //     y = window.scrollY + 12;

    //     while (off) {
    //       x += off.offsetLeft;
    //       y += off.offsetTop;
    //       off = off.offsetParent;
    //     }

    //     dragObj.connectorShape.setAttributeNS(null, 'x2', x);
    //     dragObj.connectorShape.setAttributeNS(null, 'y2', y);

    //     // var str = '' + toElem.className;

    //     // If we're over a connection point, make the connection
    //     if (dragObj.originIsInput) {
    //       if (toElem.classList.contains('node-output')) {
    //         // can connect!
    //         this.connectNodes(toElem, dragObj.elNode);
    //         return;
    //       }
    //     } else {  // first node was an output, so we're looking for an input
    //       if (toElem.classList.contains('node-input')) {
    //         // can connect!
    //         // TODO: first: swap the line endpoints so they're consistently x1->x2
    //         // That makes updating them when we drag nodes around easier.
    //         this.connectNodes(dragObj.elNode, toElem);
    //         return;
    //       }
    //     }
    //   }

    //   // Otherwise, delete the line
    //   dragObj.connectorShape.parentNode.removeChild(dragObj.connectorShape);
    //   dragObj.connectorShape = null;
    // },


    //


    // *
    //  * Make a connection between two connection point elements.
    //  * The src and dst params are connection point elems, NOT
    //  * the node elems themselves.
    //  * @param  {[type]} src The source connection point elem
    //  * @param  {[type]} dst The destination connection point elem
    //  * @return {[type]}     [description]
    //  * /
    // connectNodes(src, dst) {
    //   var connectorShape = dragObj.connectorShape;
    //   var connector = {};

    //   src.className += ' connected';
    //   dst.className += ' connected';

    //   // We want to be dealing with the audio node elements from here on
    //   src = src.parentNode;
    //   dst = dst.parentNode;

    //   // Put an entry into the source's outputs
    //   if (!src.outputConnections) {
    //     src.outputConnections = [];
    //   }

    //   connector.line = connectorShape;
    //   connector.destination = dst;
    //   src.outputConnections.push(connector);

    //   // Make sure the connector line points go from src->dest (x1->x2)
    //   if (!dragObj.originIsInput) { // need to flip
    //     var shape = connectorShape;
    //     var x = shape.getAttributeNS(null, 'x2');
    //     var y = shape.getAttributeNS(null, 'y2');
    //     shape.setAttributeNS(null, 'x2', shape.getAttributeNS(null, 'x1'));
    //     shape.setAttributeNS(null, 'y2', shape.getAttributeNS(null, 'y1'));
    //     shape.setAttributeNS(null, 'x1', x);
    //     shape.setAttributeNS(null, 'y1', y);
    //   }
    //   // Put an entry into the destinations's inputs
    //   if (!dst.inputConnections) {
    //     dst.inputConnections = [];
    //   }

    //   connector = {
    //     line: connectorShape,
    //     source: src,
    //     destination: dst
    //   };
    //   dst.inputConnections.push(connector);

    //   // if the source has an audio node, connect them up.
    //   // AudioBufferSourceNodes may not have an audio node yet.
    //   if (src.audioNode) {
    //     src.audioNode.connect(dst.audioNode);
    //   }

    //   if (dst.onConnectInput) {
    //     dst.onConnectInput();
    //   }

    //   connectorShape.inputConnection = connector;
    //   connectorShape.destination = dst;
    //   connectorShape.onclick = this.deleteConnection;

    //   connectorShape = null;
    // },

    // deleteConnection() {
    //   var connections = this.destination.inputConnections;

    //   var index = connections.indexOf(this.inputConnection);
    //   // this.breakSingleInputConnection(connections, connections.indexOf(this.inputConnection));
    // // },

    // // breakSingleInputConnection(connections, index) {
    //   var connector = connections[index];
    //   var src = connector.source;

    //   // delete us from their .outputConnections,
    //   src.outputConnections.splice(src.outputConnections.indexOf(connector.destination), 1);
    //   if (src.audioNode) {  // they may not have an audioNode, if they're a BSN or an Oscillator
    //     // call disconnect() on the src,
    //     src.audioNode.disconnect();
    //     // if there's anything left in their outputConnections, re.connect() those nodes.
    //     // TODO: again, this will break due to src resetting.
    //     for (let j = 0; j < src.outputConnections.length; j++) {
    //       src.audioNode.connect(src.outputConnections[j].destination.audioNode);
    //     }
    //   }

    //   // and delete the line
    //   connector.line.parentNode.removeChild(connector.line);

    //   // finally, remove us from the line.
    //   connections.splice(index, 1);
    // },

    // deleteNode() {
    //   var moduleElement = this.parentNode;

    //   // First disconnect the audio
    //   this.disconnectNode(moduleElement);
    //   // Then delete the visual element
    //   moduleElement.parentNode.removeChild(moduleElement);
    // },

    // /**
    //  * Disconnect a node from all other nodes connecting to it, or that it connects to.
    //  * @param  {[type]} nodeElement [description]
    //  * @return {[type]}             [description]
    //  * /
    // disconnectNode(nodeElement) {
    //   var connections;
    //   var connector;
    //   var src;

    //   // for all nodes we connect to,
    //   if (nodeElement.outputConnections) {
    //     for (let i = 0; i < nodeElement.outputConnections.length; i++) {
    //       connector = nodeElement.outputConnections[i];
    //       // find each dstElement and remove us from the dst.inputConnections,
    //       connections = connector.destination.inputConnections;
    //       connections.splice(connections.indexOf(nodeElement), 1);
    //       // and delete the line
    //       connector.line.parentNode.removeChild(connector.line);
    //     }
    //     // empty our outputConnections
    //     nodeElement.outputConnections = null;
    //   }

    //   // then call disconnect() on our audioNode to clear all outbound connections
    //   // (this is what clear the audio connection, for all outbound connections at once)
    //   if (nodeElement.audioNode) { // we may not have an audioNode, if we're a BSN or an Oscillator
    //     nodeElement.audioNode.disconnect();
    //   }

    //   // for all nodes connecting to us - (aka in us.inputConnections)
    //   if (nodeElement.inputConnections) {
    //     for (let i = 0; i < nodeElement.inputConnections.length; i++) {
    //       connector = nodeElement.inputConnections[i];
    //       // this is trickier, because we'll have to destroy all their outbound connections.
    //       // TODO: this will suck for source nodes.
    //       src = connector.source;
    //       connections = src.outputConnections;
    //       // delete us from their .outputConnections,
    //       connections.splice(connections.indexOf(nodeElement), 1);

    //       if (src.audioNode) {  // they may not have an audioNode, if they're a BSN or an Oscillator
    //         // call disconnect() on the src,
    //         src.audioNode.disconnect();
    //         // if there's anything in their outputConnections, re.connect() those nodes.
    //         // TODO: again, this will break due to src resetting.
    //         for (let j = 0; j < connections.length; j++) {
    //           src.audioNode.connect(connections[i].destination.audioNode);
    //         }
    //       }

    //       // and delete the line
    //       connector.line.parentNode.removeChild(connector.line);
    //     }
    //     // empty inputConnections
    //     nodeElement.inputConnections = null;
    //   }
    // }

  }
};

