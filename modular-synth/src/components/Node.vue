<template>
  <div
    class="node module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown="startDraggingNode">

    <div class="module-interface">
      <h3>Node - {{ idx }}</h3>
      <!-- x:{{ x }} -->
      y:{{ y }}
      {{ dragging }}
    </div>
    <!-- <span click="deleteNode">X</span> -->
    <div class="module-connections">


      <div class="inputs">
      <!--
        <inlet v-for="inlet in inlets"
          :label="inlet.label"
          :x.sync="inlet.x"
          :y.sync="inlet.y"
          :nodex="x"
          :nodey="y">
        </inlet>
      -->


        <span v-for="inlet in inlets"
          data-label="{{ inlet.label }}"
          class="input">
        </span>

      </div>

      <div class="outputs">
        <span v-for="outlet in outlets"
          @mousedown.prevent.stop="startDraggingConnector($event, outlet)"
          data-label="{{ outlet.label }}"
          class="output">
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
    idx: null
  },

  data() {
    return {
      inlets: [{
        x: 0,
        y: 0,
        label: 'freq',
        connections: []
      }, {
        x: 1,
        y: 1,
        label: 'gain',
        connections: []
      }, {
        x: 2,
        y: 2,
        label: 'range',
        connections: []
      }],

      outlets: [{
        label: 'outputL',
        data: this.outputL,
        connections: []
      }, {
        label: 'outputR',
        connections: []
      }],

      width: 0
      // x: 0,
      // y: 0
      // position: {
      //   top: 0,
      //   left: 0
      // },
      // dragging: false
    };
  },

  computed: {
    width: function() { return this.$el.offsetWidth; }
  },

  components: {
    'inletttt': {
      template: '<span data-label="{{ label }}" class="input"></span>',
      props: {
        label: '',
        x: 0,
        y: 0,
        nodey: 0,
        nodex: 0
      },
      computed: {
        x: function() { return this.nodex - 3; },
        y: function() { return this.nodey + this.$el.offsetTop + 7 + 80; } // 7 is 1/2 the height of the port
      }
    }
  },

  ready() {
    // dummy outlet for test
    this.input = this.context.createGain();
    this.outputL = this.context.createGain();
    this.outputR = this.context.createGain();

    var e = this.$el;

    e.id = 'module-' + this.idx;
    e.style.left = '200px';
    e.style.top = '200px';
  },

  methods: {
    startDraggingConnector(event, outlet) {
      this.$dispatch('connection:start', {
        port: event.target,
        output: this.output,
        outlet: outlet,
        node: this
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
      padding: 1em 4em;
    }

    &-connections {
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
