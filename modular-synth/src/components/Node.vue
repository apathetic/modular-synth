<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mouseover.stop="setActiveModule(id)"
  @mousedown.prevent="startDraggingNode">
  <!-- @mousedown.prevent="dragStart($event, this)"> -->

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <slot name="interface"></slot>
    </div>

    <!-- @mouseup.stop="updateConnection_(inlet)" -->
    <div class="module-connections">
      <div class="inlets">
        <span v-for="inlet in inlets"
          data-label="{{ inlet.label }}"
          data-port="{{ $index }}"
          class="inlet">
        </span>
      </div>

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
import { setActiveModule, newConnection, updateConnection_ } from '../vuex/actions';

export default {
  mixins: [draggable],

  vuex: {
    actions: {
      setActiveModule,
      newConnection,
      updateConnection_
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
          port: 0,
          label: 'freq',
          data: this.input
        }, {
          port: 1,
          label: 'gain',
          data: null // this.input
        }, {
          port: 2,
          label: 'range',
          data: null // this.input
        }
      ],

      outlets: [
        {
          port: 0,
          label: 'output-1',
          data: null // this.outputL   // src?
        }, {
          port: 1,
          label: 'output-2',
          data: null // this.outputR
        }
      ]
    };
  },

  created() {
    // dummy outlet for test
    this.inlets[0].data = this.context.createGain();

    this.outlets[0].data = this.context.createGain();
    this.outlets[1].data = this.context.createGain();
  }
};

</script>


<style lang="scss">
  .module {
    position: absolute;
    display: inline-block;
    background: #444; // #888;
    border: 1px solid #666;
    border-radius: 2px;
    z-index: 1;

    // TODO
    min-width: 206px;
    min-height: 80px;

    &:hover {
      // background: #eff;
      border-color: lightblue;
    }

    &.dragging {
      cursor: move;
    }

    &-details {
      background: #444;
      padding: 0.2em;
      display: none;
    }

    &-interface {
      padding: 1em 4em;


      // // TODO
      // min-width: 206px;
      // min-height: 80px;

    }

    &-connections {
      position: absolute;
      width: 100%;
      top: 0;
      font-size: 10px;

      span {
        position: absolute;
        display: block;
        width: 3px;
        height: 12px;
        background: #eee; // #111;
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
