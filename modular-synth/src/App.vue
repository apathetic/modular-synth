//------------------------------------------------
//  APPLICATION
// -----------------------------------------------

<template>
  <section
    id="modules"
    :class="editing ? 'edit-mode': 'play-mode'"
    v-el:modules
    >
    <!-- @mousemove.prevent.stop="whileDraggingConnector" -->
    <!-- @mouseup="stopDraggingConnector" -->


<!--
  this.handle.addEventListener('mousedown',  (e) => this._dragStart(e));
  this.handle.addEventListener('mousemove',  (e) => this._drag(e));
  this.handle.addEventListener('mouseup',    (e) => this._dragEnd(e));
  this.handle.addEventListener('mouseleave', (e) => this._dragEnd(e));
  this.handle.addEventListener('click', (e) => {
    if (this.dragThresholdMet) { e.preventDefault(); }
  });
 -->

    <component v-for="node in nodes"
      :is="node.type"
      :idx="node.idx"
      track-by="$index">
    </component>

  </section>

  <svg id="connections">
    <line v-for="line in connections"
      @click="deleteConnection"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      stroke="black"
      stroke-width="2">
    </line>
  </svg>

  <aside id="controls" v-el:controls>
    <button @click="toggleEditMode">{{ editing ? 'Play Mode' : 'Edit mode' }}</button>
    <button @click="newNode('Node')">add Node</button>
    <button @click="newNode('Oscillator')">add osc</button>

    <div>
      <p>selected Component details / info ? debug?</p>

      <midi></midi>
    </div>

    <button>  ► </button>
    <button>
      Audio (power) On
      <img src="/static/images/reset1.svg">
    </button>
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

import Oscillator from './components/Oscillator';
import Node from './components/Node';
import midi from './components/system/Midi.vue';

var idx = 0;
var dragObj = {
  zIndex: 0,
  cursorStartX: null,
  cursorStartY: null,
  source: null,
  line: null

  // connectorShape: null
  // startLeft: null,
  // startTop: null,
  // lastLit: null,
  // elNode: null,
};

export default {
  components: {
    Oscillator,
    Node,
    midi
  },

  data() {
    return {
      editing: true,
      nodes: [],
      connections: []
    };
  },

  ready() {
    this.$on('connection:start', this.startDraggingConnector);
    // this.$on('connection:update', this.updateConnections);
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


    startDraggingConnector(source) {
      let x;
      let y;
      let BCR = source.port.getBoundingClientRect();

      dragObj.source = source;

      // Get the position of the originating connector with respect to the page.
      x = BCR.left;
      y = BCR.top;
      x += 1 + BCR.width / 2;
      y += 1 + BCR.height / 2;

      // Save starting positions of cursor.
      dragObj.cursorStartX = x;
      dragObj.cursorStartY = y;

      let line = {
        x1: x,
        y1: y,
        x2: x,
        y2: y
      };
      this.connections.push(line);
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

    stopDraggingConnector(event) {
      var toElem = event.toElement || event.relatedTarget || event.target || false;
      // let input = 'input';  // toElem.getAttribute('data-connects');
      let x;
      let y;
      let BCR = toElem.getBoundingClientRect();

      // Stop capturing mousemove and mouseup events.
      document.removeEventListener('mousemove', this.whileDraggingConnector); // .bind(this)
      document.removeEventListener('mouseup', this.stopDraggingConnector);    // .bind(this)

      // TODO better check for this?
      if (toElem.classList.contains('input')) {
        // TODO
        // find the node that contains the inlet we want to connect to
        let destNode = this.$children.find(function(node) {
          return node.$el.contains(toElem);
        });

        x = BCR.left;
        y = BCR.top;
        x += 1 + BCR.width / 2;   // TODO move into computed props
        y += 1 + BCR.height / 2;

        dragObj.line.x2 = x;
        dragObj.line.y2 = y;

        let sourceNode = dragObj.source.node;
        let outlet = dragObj.source.outlet;
        let inletLabel = toElem.getAttribute('data-label');
        let inlet = destNode.inlets.find(function(inlet) { return inlet.label === inletLabel; });

        this.connectNodes(sourceNode, outlet, destNode, inlet);
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
    connectNodes(sourceNode, outlet, destNode, inlet) {
      let line = dragObj.line;
      let audioOut = sourceNode[outlet.label] || false;
      let audioIn = destNode[inlet.label] || false;

      // visual
      outlet.connections.push(line);
      inlet.connections.push(line);

      // functional
      if (audioOut && audioIn) {
        audioOut.connect(audioIn);
      }
    },



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
