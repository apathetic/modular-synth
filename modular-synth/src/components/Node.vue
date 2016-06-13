<template>
  <div
    class="module"
    :class="[type, dragging ? 'dragging' : '']"
    :style="position"
    @mousedown="startDraggingNode"
    >
    <div class="module-interface">
      <h3>{{ type }}-{{ idx }}</h3>
      x:{{ position.left }}
      y:{{ position.top }}
      {{ dragging }}
    </div>
    <!-- <span click="deleteNode">X</span> -->
    <div class="module-connectors">
      <div class="inputs">
        <span v-for="input in inputs"
          data-label="{{ input }}"
          class="input">
          <!-- {{ input }} -->
        </span>
      </div>
      <div class="outputs">
        <span v-for="output in outputs"
          @mousedown="startDraggingConnector"
          data-label="{{ output }}"
          class="output">
          <!-- {{ output }} -->
        </span>
      </div>
    </div>
  </div>

</template>


 <script>
import {draggable} from '../mixins';

export default {
  mixins: [draggable],

  props: {
    type: null,
    idx: null
  },

  data() {
    return {
      inputs: ['freq', 'gain', 'range'],
      outputs: ['Audio 1', 'Audio 2'],

      inputConnections: [],
      outputConnections: []
    };
  },

  ready() {
    // dummy outlet for test
    this.input = this.context.createGain();
    this.output = this.context.createGain();

    console.log(this.type);
    var e = this.$el;
    // e.className = 'module ' + this.type;
    e.id = 'module-' + this.idx;
    e.style.left = '200px';
    e.style.top = '200px';
  },

  methods: {
    startDraggingConnector(event) {
      event.preventDefault();
      event.stopPropagation();
      // let node = this.output;
      // let outlet = event.target;
      this.$dispatch('connector:start', {
        connector: event.target,
        output: this.output
      });
    }
  }
};

</script>


<style lang="scss">
  .module {
    position: absolute;
    display: inline-block;
    background: #eef;
    border: 1px solid #000;

    &:hover {
      background: #eff;
    }

    &.dragging {
      cursor: move;
    }

    &-interface {
      padding: 1em;
    }

    &-connectors {
      position: absolute;
      width: 100%;
      top: 0;
      font-size: 10px;

      span {
        position: absolute;
        display: block;
        width: 5px;
        height: 14px;
        background: #111;
        cursor: pointer;

        // text-indent: 1em;

        &:hover {
          background: orange;
        }

        &:after {
          content: attr(data-label);
          width: 5em;
          position: absolute;
          // pointer-events: none;
        }

        // we provide for the case of <= 4 inputs/outputs
        &:nth-child(1) { top: 10px; }
        &:nth-child(2) { top: 30px; }
        &:nth-child(3) { top: 50px; }
        &:nth-child(4) { top: 70px; }
      }
    }

    .input {
      left: -5px;

      &:after {
        left: 1em;
      }
    }

    .output {
      right: -5px;

      &:after {
        right: 1em;
        text-align: right;
      }
    }
  }
</style>
