<template>
  <div
    class="module {{ nodeType }}"
    @mousedown="startDraggingNode"
    >
    <h3>{{ type }}{{ idx }}</h3>
    <span click="deleteNode">X</span>
    {{ temp }}
    <span v-for="input in inputs" @mousedown="startDraggingConnector">=</span>
    <slot></slot>
    <span v-for="output in outputs" @mousedown="startDraggingConnector">=</span>

  </div>

</template>


<script>
// var dragObj = {
//   zIndex: 0,
//   lastLit: null
// };

import {draggable} from '../mixins';

export default {
  mixins: [draggable],

  props: {
    type: null,
    idx: null,
    inputs: [],
    outputs: []
  },

  data() {
    return {
      x: 0,
      y: 0,
      temp: null
    };
  },
  computed: {
    temp: function() {
      return JSON.stringify(this.$data);
    }
  },

  ready() {
    console.log(this.type);
    var e = this.$el;
    // e.className = 'module ' + this.type;
    e.id = 'module' + this.idX;
    e.style.left = '200px';
    e.style.top = '200px';
  }
  /*
  methods: {
    startDraggingNode(event) {
      var el;
      var x, y;

      if (event.target.tagName === 'SELECT') return;
      el = event.target;

      if (el.nodeType === 3) el = el.parentNode; // if it's a text node
      if (el.classList.contains('module-title')) el = el.parentNode;
      if (el.classList.contains('content')) el = el.parentNode;
      if (!el.classList.contains('module')) return;

      dragObj.elNode = el;

      el.classList.add('dragging');

      // Get cursor position with respect to the page.
      x = event.clientX + window.scrollX;
      y = event.clientY + window.scrollY;

      // Save starting positions of cursor and element.
      dragObj.cursorStartX = x;
      dragObj.cursorStartY = y;
      dragObj.elStartLeft = parseInt(dragObj.elNode.style.left, 10);
      dragObj.elStartTop = parseInt(dragObj.elNode.style.top, 10);

      if (isNaN(dragObj.elStartLeft)) dragObj.elStartLeft = 0;
      if (isNaN(dragObj.elStartTop)) dragObj.elStartTop = 0;

      // Update element's z-index.
      dragObj.elNode.style.zIndex = ++dragObj.zIndex;

      // Capture mousemove and mouseup events on the page.
      document.addEventListener('mousemove', this.whileDraggingNode);
      document.addEventListener('mouseup', this.stopDraggingNode);

      event.preventDefault();
    },

    whileDraggingNode(event) {
      var off;
      var x, y;
      var e = dragObj.elNode;   // this.$el
      var c;

      // Get cursor position with respect to the page.
      x = event.clientX + window.scrollX;
      y = event.clientY + window.scrollY;

      // Move drag element by the same amount the cursor has moved.
      e.style.left = (dragObj.elStartLeft + x - dragObj.cursorStartX) + 'px';
      e.style.top = (dragObj.elStartTop + y - dragObj.cursorStartY) + 'px';

      if (e.inputConnections) { // update any lines that point in here.
        off = e.inputs;
        x = window.scrollX + 12;
        y = window.scrollY + 12;

        while (off) {
          x += off.offsetLeft;
          y += off.offsetTop;
          off = off.offsetParent;
        }

        for (c = 0; c < e.inputConnections.length; c++) {
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

        for (c = 0; c < e.outputConnections.length; c++) {
          e.outputConnections[c].line.setAttributeNS(null, 'x2', x);
          e.outputConnections[c].line.setAttributeNS(null, 'y2', y);
        }
      }

      event.preventDefault();
    },

    stopDraggingNode(event) {
      document.removeEventListener('mousemove', this.whileDraggingNode);
      document.removeEventListener('mouseup', this.stopDraggingNode);
      this.$el.classList.remove('dragging');
    },

    startDraggingConnector(event) {
      // var el;
      var x, y;

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
    }
  }
  */
};

</script>


<style lang="scss">
  .module {
    display: inline-block;
    padding: 1em;
    background: #eef;
    border: 1px solid #000;

    &:hover {
      background: #eff;
    }

    &.dragging {
      cursor: move;
    }
  }
</style>
