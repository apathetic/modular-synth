//------------------------------------------------
//  APPLICATION
// -----------------------------------------------

<template>
  <section id="modules" :class="editing ? 'edit-mode': 'play-mode'" v-el:modules>
    <component v-for="node in nodes"
      :is="node.type"
      :type="node.type"
      :idx="node.idx"
      track-by="$index">
    </component>
  </section>

  <svg id="connections" v-el:connections>
    <!-- <line x1="460.28125" y1="270" x2="572" y2="359" stroke="black" stroke-width="3"></line> -->
    <line :coords="coords" stroke="black" stroke-width="3"></line>
  </svg>

  <aside id="controls" v-el:controls>
    <button @click="toggleEditMode">{{ editing ? 'Play Mode' : 'Edit mode' }}</button>
    <button @click="newNode('Node')">add Node</button>
    <button @click="newNode('Oscillator')">add osc</button>
    <div>
      selected Component details / info ? debug?
    </div>
    <button>  ► </button>
    <button>Audio (power) On</button>
    <!-- <master-out></master-out> -->
    <input id="masterOut1" type="range" min="0.0" max="1.0" step="0.1" value="0.0" />
    <input id="masterOut2" type="range" min="0.0" max="1.0" step="0.1" value="0.0" />
  </aside>
</template>

<script>
// Note: much of this code inspired by:
// https://github.com/cwilso/WebAudio
// https://github.com/idflood/ThreeNodes.js
// https://github.com/gre/zound-live
//
// import Vue from 'vue';
import Oscillator from './components/Oscillator';
import Node from './components/Node';

var idx = 0;
var dragObj = {
  zIndex: 0,
  // lastLit: null,
  // elNode: null,
  cursorStartX: null,
  cursorStartY: null,
  elStartLeft: null,
  elStartTop: null,

  connectorShape: null
};

export default {
  components: {
    Oscillator,
    Node
  },

  data() {
    return {
      editing: true,
      nodes: [],
      connections: []      // TODO let VUE manage the svg connections
    };
  },

  ready() {
    this.connections = this.$els.connections;

    this.$on('connector:start', this.startDraggingConnector);
  },

  methods: {
    toggleEditMode() {
      this.editing = !this.editing;
    },

    newNode(type) {
      // [TODO] use v-ref instead of idX
      // var N = Vue.extend({
      //   // props: {'type': type, idx: idx++},
      //   data: () => ({'type': type, 'idx': idx++})
      // });

      this.nodes.push({
        type: type,
        idx: idx++
      });
    },


    //


    startDraggingConnector(node) {
      const svgns = 'http://www.w3.org/2000/svg';
      let x;
      let y;
      let shape;
      let outlet = node.connector;
      let BCR = outlet.getBoundingClientRect();

      dragObj.node = node;

      // Get the position of the originating connector with respect to the UI.
      // x = outlet.offsetLeft + node.$el.offsetLeft;
      // y = outlet.offsetTop + node.$el.offsetTop;

      // Get the position of the originating connector with respect to the page.
      x = BCR.left;
      y = BCR.top;
      x += 1 + BCR.width / 2;
      y += 1 + BCR.height / 2;

      // Save starting positions of cursor.
      dragObj.cursorStartX = x;
      dragObj.cursorStartY = y;

      // Create a connector visual line
      shape = document.createElementNS(svgns, 'line');

      shape.setAttributeNS(null, 'x1', x);
      shape.setAttributeNS(null, 'y1', y);
      shape.setAttributeNS(null, 'x2', x);
      shape.setAttributeNS(null, 'y2', y);
      shape.setAttributeNS(null, 'stroke', 'black');
      shape.setAttributeNS(null, 'stroke-width', '3');
      dragObj.connectorShape = shape;


      // TODO THIS:::
      document.getElementById('connections').appendChild(shape);
      // VS:

      // let line = {
      //   x1: x,
      //   y1: y,
      //   x2: x,
      //   y2: y
      // }
      // this.connections.push(line);


      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingConnector);
      document.addEventListener('mouseup', this.stopDraggingConnector); // .bind(this)
      // event.preventDefault();
      // event.stopPropagation();
    },

    whileDraggingConnector(event) {
      var x, y;
      // var toElem = e.toElement;
      // var toElem = event.toElement || event.relatedTarget || event.target || false;

      // Get cursor position with respect to the page.
      x = event.clientX; // + window.scrollX;
      y = event.clientY; // + window.scrollY;

      // Move connector visual line
      dragObj.connectorShape.setAttributeNS(null, 'x2', x);
      dragObj.connectorShape.setAttributeNS(null, 'y2', y);

      // If this is a text node, use its parent element.
      // if (toElem.nodeType === 3) {
      //   toElem = toElem.parentNode;
      // }

      /*
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
        // if (dragObj.lastLit && (dragObj.lastLit !== toElem)) {
        //   dragObj.lastLit.className = dragObj.lastLit.unlitClassname;
        //   dragObj.lastLit = null;
        // }

        // light up connector point underneath, if any
        // if (toElem.classList.contains('node')) {
        //   if (!dragObj.lastLit || (dragObj.lastLit !== toElem)) {
        //     if (dragObj.originIsInput) {
        //       if (toElem.classList.contains('node-output')) {
        //         // toElem.unlitClassname = toElem.className;
        //         toElem.className += ' canConnect';
        //         dragObj.lastLit = toElem;
        //       }
        //     } else {  // first node was an output, so we're looking for an input
        //       if (toElem.classList.contains('node-input')) {
        //         // toElem.unlitClassname = toElem.className;
        //         toElem.className += ' canConnect';
        //         dragObj.lastLit = toElem;
        //       }
        //     }
        //   }
        // }
      }
      */

      event.preventDefault();
      event.stopPropagation();
    },

    stopDraggingConnector(event) {
      var toElem = event.toElement || event.relatedTarget || event.target || false;
      let x;
      let y;
      let BCR = toElem.getBoundingClientRect();

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.whileDraggingConnector); // .bind(this)
      document.removeEventListener('mouseup', this.stopDraggingConnector);    // .bind(this)

      // TODO better check for this?
      if (toElem.classList.contains('input')) {
        x = BCR.left;
        y = BCR.top;
        x += 1 + BCR.width / 2;   // TODO move into computed props
        y += 1 + BCR.height / 2;

        dragObj.connectorShape.setAttributeNS(null, 'x2', x);
        dragObj.connectorShape.setAttributeNS(null, 'y2', y);

        // TODO
        // find the node that contains the inlet we want to connect to
        let destNode = this.$children.find(function(node) {
          // node.$el "is parent" of toElem
          return node.$el.contains(toElem);
        });

        this.connectNodes(dragObj.node, {
          connector: toElem,
          input: destNode
        });
      } else {
        // Otherwise, delete the line
        dragObj.connectorShape.parentNode.removeChild(dragObj.connectorShape);
        dragObj.connectorShape = null;
      }
    },


    //


    /**
     * Make a connection between two connection point elements.
     * The src and dst params are connection inputs/outputs, NOT
     * the node elements themselves.
     * @param  {[type]} src The source connection point
     * @param  {[type]} dst The destination connection point
     * @return {[type]}     [description]
     */
    connectNodes(source, destination) {
      var connectorShape = dragObj.connectorShape;
      var connector = {};

      console.log('in app', this, source, destination);

      // source.className += ' connected';
      // destination.className += ' connected';
      source.connector.classList.add('connected');
      destination.connector.classList.add('connected');

      // We want to be dealing with the audio node elements from here on
      // source = source.parentNode;
      // destination = destination.parentNode;
      source = source.output;
      destination = destination.input;

      // Put an entry into the source's outputs
      if (!source.outputConnections) {
        source.outputConnections = [];
      }

      // connector.line = connectorShape;
      // connector.destination = destination;
      source.outputConnections.push(connector);

      // Make sure the connector line points go from source->dest (x1->x2)
      // if (!dragObj.originIsInput) { // need to flip
      //   var shape = connectorShape;
      //   var x = shape.getAttributeNS(null, 'x2');
      //   var y = shape.getAttributeNS(null, 'y2');
      //   shape.setAttributeNS(null, 'x2', shape.getAttributeNS(null, 'x1'));
      //   shape.setAttributeNS(null, 'y2', shape.getAttributeNS(null, 'y1'));
      //   shape.setAttributeNS(null, 'x1', x);
      //   shape.setAttributeNS(null, 'y1', y);
      // }
      // Put an entry into the destinations's inputs
      if (!destination.inputConnections) {
        destination.inputConnections = [];
      }

      connector = {
        line: connectorShape,
        source: source,
        destination: destination
      };
      destination.inputConnections.push(connector);

      // if the source has an audio node, connect them up.
      // AudioBufferSourceNodes may not have an audio node yet.
      if (source.audioNode) {
        source.audioNode.connect(destination.audioNode);
      }

      if (destination.onConnectInput) {
        destination.onConnectInput();
      }

      connectorShape.inputConnection = connector;
      connectorShape.destination = destination;
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
    }
  }
};

</script>

<style src="assets/scss/styles.scss" lang="scss"></style>
