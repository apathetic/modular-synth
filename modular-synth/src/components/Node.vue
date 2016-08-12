<template>
  <div
    data-id="{{ id }}"
    class="module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mouseover.stop="setActive(id)"
    @mousedown.prevent="startDraggingNode">
    <!-- @mousedown.prevent="dragStart($event, this)"> -->
    {{ width }}
    <div class="module-interface">
      <h3>Node - {{ id }}</h3>
      <br />
      <br />
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="inlet in inlets"
          data-label="{{ inlet.label }}"
          data-port="{{ $index }}"
          class="inlet">
        </span>
      </div>

      <!-- @mousedown.stop="createConnector($event, outlet)" -->
      <div class="outlets">
        <span v-for="outlet in outlets"
          @mousedown.stop="newConnection(outlet)"
          data-label="{{ outlet.label }}"
          data-port="{{ outlet.port }}"
          class="outlet">
        </span>
      </div>
    </div>
  </div>
</template>


<script>
import { draggable } from '../mixins';
import { setActive, newConnection } from '../vuex/actions';

export default {
  mixins: [draggable],
  vuex: {
    actions: {
      setActive,
      newConnection
    }
  },

  props: {
    id: null
  },

  data() {
    return {
      name: 'Node',

      inlets: [
        {
          label: 'freq',
          connections: []   // TODO remove. use computed props
        }, {
          label: 'gain',
          to: this.input,
          connections: []
        }, {
          label: 'range',
          connections: []
        }
      ],

      outlets: [
        {
          port: 0,
          label: 'outputL',
          data: this.outputL   // to: this.output?
          // connections: []
        }, {
          port: 1,
          label: 'outputR',
          data: this.outputR
          // connections: []
        }
      ]
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

  ready() {
    var module = this.$el;

    this.width = '202px'; // module.$el.offsetWidth;

    // dummy outlet for test
    this.input = this.context.createGain();
    this.outputL = this.context.createGain();
    this.outputR = this.context.createGain();



    module.id = 'module-' + this.id;
    module.style.left = '200px';
    module.style.top = '200px';
  },

  methods: {
    // test(e) {
    //   dragStart(e);
    //   // this.startDraggingNode(e);
    // },
    //
    // createConnector(event, outlet) {
    //   //
    //   //
    //
    //   /* */
    //   // keep this "end" of the line's source of truth in this
    //   // component. Then, this node can update itself and the
    //   // data shared in the Connector *should* update as well.
    //   let from = {
    //     module: this,
    //     label: outlet.label,
    //     data: outlet.data,
    //     port: event.target,
    //     connections: outlet.connections
    //   };
    //
    //   this.$dispatch('connector:new', from);
    //   /* */
    // }


    // startDraggingConnector(event, outlet) {
    //   this.$dispatch('connection:start', {
    //     port: event.target,
    //     /// output: this.output,
    //     outlet: outlet,
    //     node: this
    //   });
    // }
  }
};

</script>


<style lang="scss">
  .module {
    position: absolute;
    display: inline-block;
    background: #eef;
    border: 1px solid #000;
    z-index: 1;

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
        &:nth-child(5) { top: 90px; }
        &:nth-child(6) { top: 110px; }
      }
    }

    .inlet {
      left: -5px;

      &:after {
        left: 1em;
      }
    }

    .outlet {
      right: -5px;

      &:after {
        right: 1em;
        text-align: right;
      }
    }
  }
</style>
