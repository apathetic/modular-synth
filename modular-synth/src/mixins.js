/* * /
// Create Audio Input mixin
// CREATE MIXIN from Node.vue?  AudioInput / ControlInputs / ...
var inputs = {
  methods: {
    addInput: function() {
      console.log('hello from mixin!');
    }
  }
};
console.log(inputs);
// var Component = Vue.extend({
//   mixins: [inputs, outputs,...]
// })
/* */

var dragObj = {
  zIndex: 0,
  lastLit: null,
  // elNode: null,
  cursorStartX: null,
  cursorStartY: null,
  elStartLeft: null,
  elStartTop: null
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
      position: {
        top: 0,
        left: 0
      },
      dragging: false
    };
  },
  methods: {
    startDraggingNode(event) {
      var el = this.$el;  // event.target;
      // dragObj.elNode = el;
      this.dragging = true;

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = event.clientX; // + window.scrollX;
      dragObj.cursorStartY = event.clientY; // + window.scrollY;
      dragObj.elStartLeft = el.offsetLeft || 0;
      dragObj.elStartTop = el.offsetTop || 0;

      // Update element's z-index.
      el.style.zIndex = ++dragObj.zIndex;

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingNode);
      document.addEventListener('mouseup', this.stopDraggingNode);

      event.preventDefault();
    },

    whileDraggingNode(event) {
      var off;
      var x = event.clientX; // + window.scrollX;
      var y = event.clientY; // + window.scrollY;
      var e = this.$el; // dragObj.elNode;

      this.position.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + 'px';
      this.position.top = (dragObj.elStartTop + y - dragObj.cursorStartY) + 'px';

      if (e.inputConnections) { // update any lines that point in here.
        off = e.inputs;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
          x += off.offsetLeft;
          y += off.offsetTop;
          off = off.offsetParent;
        }

        for (let c = 0; c < e.inputConnections.length; c++) {
          e.inputConnections[c].line.setAttributeNS(null, 'x1', x);
          e.inputConnections[c].line.setAttributeNS(null, 'y1', y);
        }
      }

      if (e.outputConnections) {  // update any lines that point out of here.
        off = e.outputs;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
          x += off.offsetLeft;
          y += off.offsetTop;
          off = off.offsetParent;
        }

        for (let c = 0; c < e.outputConnections.length; c++) {
          e.outputConnections[c].line.setAttributeNS(null, 'x2', x);
          e.outputConnections[c].line.setAttributeNS(null, 'y2', y);
        }
      }

      event.preventDefault();
    },

    stopDraggingNode(event) {
      document.removeEventListener('mousemove', this.whileDraggingNode);
      document.removeEventListener('mouseup', this.stopDraggingNode);
      this.dragging = false;
    }
  }
};

/*
export const connectify = {
  methods: {
    startDraggingConnector(event) {
      // var el;
      var x, y;
      console.log(this, event);
      dragObj.elNode = event.target;

      // If this is a text node, use its parent element.
      if (dragObj.elNode.nodeType === 3) {
        dragObj.elNode = dragObj.elNode.parentNode;
      }

      // if this is the green or red button, use its parent.
      if (dragObj.elNode.classList.contains('node-button')) {
        dragObj.elNode = dragObj.elNode.parentNode;
      }

      // Get the position of the originating connector with respect to the page.
      var off = event.target;
      x = window.scrollX + 12;
      y = window.scrollY + 12;

      while (off) {
        x += off.offsetLeft;
        y += off.offsetTop;
        off = off.offsetParent;
      }

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = x;
      dragObj.cursorStartY = y;

      // remember if this is an input or output node, so we can match
      dragObj.originIsInput = dragObj.elNode.classList.contains('node-input');

      dragObj.elNode.unlitClassname = dragObj.elNode.className;
      dragObj.elNode.className += ' canConnect';

      // Create a connector visual line
      var svgns = 'http://www.w3.org/2000/svg';

      var shape = document.createElementNS(svgns, 'line');
      shape.setAttributeNS(null, 'x1', x);
      shape.setAttributeNS(null, 'y1', y);
      shape.setAttributeNS(null, 'x2', x);
      shape.setAttributeNS(null, 'y2', y);
      shape.setAttributeNS(null, 'stroke', 'black');
      shape.setAttributeNS(null, 'stroke-width', '5');
      dragObj.connectorShape = shape;

      document.getElementById('svgCanvas').appendChild(shape);

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingConnector);
      document.addEventListener('mouseup', this.stopDraggingConnector); // .bind(this)
      event.preventDefault();
      event.stopPropagation();
    },

    whileDraggingConnector(event) {
      var x, y;
      var toElem = event.toElement;

      // Get cursor position with respect to the page.
      x = event.clientX + window.scrollX;
      y = event.clientY + window.scrollY;

      // Move connector visual line
      dragObj.connectorShape.setAttributeNS(null, 'x2', x);
      dragObj.connectorShape.setAttributeNS(null, 'y2', y);

      // If this is a text node, use its parent element.
      if (toElem.nodeType === 3) {
        toElem = toElem.parentNode;
      }

      if (toElem.classList) { // if we don't have class, we're not a node.
        // if this is the green or red button, use its parent.
        if (toElem.classList.contains('node-button')) {
          toElem = toElem.parentNode;
        }

        // if we're over our originating node, do nothing.
        if (toElem === dragObj.elemNode) {
          return;
        }

        // If we used to be lighting up a node, but we're not over it anymore,
        // unlight it.
        if (dragObj.lastLit && (dragObj.lastLit !== toElem)) {
          dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
          dragObj.lastLit = null;
        }

        // light up connector point underneath, if any
        if (toElem.classList.contains('node')) {
          if (!dragObj.lastLit || (dragObj.lastLit !== toElem)) {
            if (dragObj.originIsInput) {
              if (toElem.classList.contains('node-output')) {
                toElem.unlitClassname = toElem.className;
                toElem.className += ' canConnect';
                dragObj.lastLit = toElem;
              }
            } else {  // first node was an output, so we're looking for an input
              if (toElem.classList.contains('node-input')) {
                toElem.unlitClassname = toElem.className;
                toElem.className += ' canConnect';
                dragObj.lastLit = toElem;
              }
            }
          }
        }
      }

      event.preventDefault();
      event.stopPropagation();
    },

    stopDraggingConnector(event) {
      var x;
      var y;
      var off;
      var toElem;

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.whileDraggingConnector); // .bind(this)
      document.removeEventListener('mouseup', this.stopDraggingConnector);    // .bind(this)

      if (dragObj.lastLit) {
        dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
        dragObj.lastLit = null;
      }

      dragObj.elNode.className = dragObj.elNode.unlitClassname;

      toElem = event.toElement || event.target;

      // If this is a text node, use its parent element.
      if (toElem.nodeType === 3) {
        toElem = toElem.parentNode;
      }

       // if we don't have class, we're not a node.
      if (toElem.classList) {
        // if this is the green or red button, use its parent.
        if (toElem.classList.contains('node-button')) {
          toElem = toElem.parentNode;
        }

        // Get the position of the originating connector with respect to the page.
        off = toElem;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
          x += off.offsetLeft;
          y += off.offsetTop;
          off = off.offsetParent;
        }

        dragObj.connectorShape.setAttributeNS(null, 'x2', x);
        dragObj.connectorShape.setAttributeNS(null, 'y2', y);

        // var str = '' + toElem.className;

        // If we're over a connection point, make the connection
        if (dragObj.originIsInput) {
          if (toElem.classList.contains('node-output')) {
            // can connect!
            this.connectNodes(toElem, dragObj.elNode);
            return;
          }
        } else {  // first node was an output, so we're looking for an input
          if (toElem.classList.contains('node-input')) {
            // can connect!
            // TODO: first: swap the line endpoints so they're consistently x1->x2
            // That makes updating them when we drag nodes around easier.
            this.connectNodes(dragObj.elNode, toElem);
            return;
          }
        }
      }

      // Otherwise, delete the line
      dragObj.connectorShape.parentNode.removeChild(dragObj.connectorShape);
      dragObj.connectorShape = null;
    },


    //


    /**
     * Make a connection between two connection point elements.
     * The src and dst params are connection point elems, NOT
     * the node elems themselves.
     * @param  {[type]} src The source connection point elem
     * @param  {[type]} dst The destination connection point elem
     * @return {[type]}     [description]
     * /
    connectNodes(src, dst) {
      var connectorShape = dragObj.connectorShape;
      var connector = {};

      src.className += ' connected';
      dst.className += ' connected';

      // We want to be dealing with the audio node elements from here on
      src = src.parentNode;
      dst = dst.parentNode;

      // Put an entry into the source's outputs
      if (!src.outputConnections) {
        src.outputConnections = [];
      }

      connector.line = connectorShape;
      connector.destination = dst;
      src.outputConnections.push(connector);

      // Make sure the connector line points go from src->dest (x1->x2)
      if (!dragObj.originIsInput) { // need to flip
        var shape = connectorShape;
        var x = shape.getAttributeNS(null, 'x2');
        var y = shape.getAttributeNS(null, 'y2');
        shape.setAttributeNS(null, 'x2', shape.getAttributeNS(null, 'x1'));
        shape.setAttributeNS(null, 'y2', shape.getAttributeNS(null, 'y1'));
        shape.setAttributeNS(null, 'x1', x);
        shape.setAttributeNS(null, 'y1', y);
      }
      // Put an entry into the destinations's inputs
      if (!dst.inputConnections) {
        dst.inputConnections = [];
      }

      connector = {
        line: connectorShape,
        source: src,
        destination: dst
      };
      dst.inputConnections.push(connector);

      // if the source has an audio node, connect them up.
      // AudioBufferSourceNodes may not have an audio node yet.
      if (src.audioNode) {
        src.audioNode.connect(dst.audioNode);
      }

      if (dst.onConnectInput) {
        dst.onConnectInput();
      }

      connectorShape.inputConnection = connector;
      connectorShape.destination = dst;
      connectorShape.onclick = this.deleteConnection;

      connectorShape = null;
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
    },

    deleteNode() {
      var moduleElement = this.parentNode;

      // First disconnect the audio
      this.disconnectNode(moduleElement);
      // Then delete the visual element
      moduleElement.parentNode.removeChild(moduleElement);
    },

    /**
     * Disconnect a node from all other nodes connecting to it, or that it connects to.
     * @param  {[type]} nodeElement [description]
     * @return {[type]}             [description]
     * /
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
    }
  }
};
*/
