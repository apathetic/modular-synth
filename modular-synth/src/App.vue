<template>
  <section id="modules" :class="editing ? 'edit-mode': 'play-mode'" v-el:modules>
    <component v-for="node in nodes"
      :is="node.type"
      :type="node.type"
      :idx="node.idx"
      track-by="$index">
    </component>
  </section>

  <svg id="connections" v-el:connections></svg>

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

// import Vue from 'vue';
import Oscillator from './components/Oscillator';
import Node from './components/Node';

var idx = 0;
var dragObj = {
  zIndex: 0,
  lastLit: null
};

export default {
  components: {
    Oscillator,
    Node
  },

  data() {
    return {
      editing: true,
      nodes: []
    };
  },

  ready() {
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

    /**
     * Make a connection between two connection point elements.
     * The src and dst params are connection point elems, NOT
     * the node elems themselves.
     * @param  {[type]} src The source connection point elem
     * @param  {[type]} dst The destination connection point elem
     * @return {[type]}     [description]
     */
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
      this.breakSingleInputConnection(connections, connections.indexOf(this.inputConnection));
    },

    deleteNode() {
      var moduleElement = this.parentNode;

      // First disconnect the audio
      this.disconnectNode(moduleElement);
      // Then delete the visual element
      moduleElement.parentNode.removeChild(moduleElement);
    },

    breakSingleInputConnection(connections, index) {
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
