<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"

  :data-w="w"
  :data-h="h"
  :data-col="col"
  :data-row="row"
  :data-id="id"

  @click="setSelected(id)"
  @mouseover="setActiveModule(id)"
  @mousedown.prevent="startDragging">

    {{ position | json }}

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <!--<slot></slot> -->
    </div>

    <!-- @mouseup.stop="updateConnection_(inlet)"  -->
    <div class="module-connections">
      <partial name="inlets"></partial>
      <partial name="outlets"></partial>
    </div>
  </div>
</template>


<script>
import { draggable } from '../mixins/draggable';
import { setActiveModule, setSelected, newConnection, updateConnection_ } from '../vuex/actions';

export default {
  mixins: [draggable],

  vuex: {
    actions: {
      setActiveModule,
      newConnection,
      setSelected,
      updateConnection_
    }
  },

  props: {
    id: null,
    h: null,
    w: null,
    x: null,
    y: null,
    height: null,
    width: null,
    top: null,
    left: null
  },

  computed: {
    position() {
      return {
        height: this.height + 'px',
        width: this.width + 'px',
        left: this.left + 'px',
        top: this.top + 'px'
      };
    }
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
    // position: absolute;
    // display: inline-flex;
    // flex-direction: column;
    // background: #444; // #888;
    // border: 1px solid #666;
    // border-radius: 2px;
    // z-index: 1;

    // TODO
    // min-width: 206px;
    // min-height: 80px;

    &:hover {
      // background: #eff;
      border-color: lightblue;
    }

    &.dragging {
      cursor: move;
      // z-index: 100;
    }

    &-details {
      background: #444;
      padding: 0.2em;
      // display: none;
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
      top: 2px; // 0;
      height: 0;
      font-size: 10px;

      span {
        // position: absolute;
        margin: 8px 0;
        display: block;
        width: 3px;
        height: 12px;
        background: #eee; // #111;
        cursor: pointer;
        text-transform: uppercase;
        font-size: 0.75em;

        &:hover {
          background: orange;
        }

        &:after {
          content: attr(data-label);
          width: 5em;
          position: absolute;
          text-transform: uppercase;
          line-height: 1.6;
        }

        // we provide for the case of <= 4 inputs/outputs
        // &:nth-child(1) { top: 10px; }
        // &:nth-child(2) { top: 30px; }
        // &:nth-child(3) { top: 50px; }
        // &:nth-child(4) { top: 70px; }
        // &:nth-child(5) { top: 90px; }
        // &:nth-child(6) { top: 110px; }
      }
    }

    .inlets {
      float: left;
    }

    .outlets {
      float: right;
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

  .play-mode {
    .module {
      width: 200px !important;
      height: 200px !important;
    }
  }

























  // .grid-container {
  //   z-index: 9999;
  //   position: absolute;
  //   top: 66px;
  //   left: 0;
  //   right: 10px;
  //   bottom: 0;
  //   overflow: auto;
  // }

  // .grid {
  //   position: relative;
  //   height: 100%;
  //   list-style: none;
  // }

  .module {
    height: 200px;
    width: 200px;
    border: 1px solid #fff;
    position: absolute;
    transition: height 0.2s, width 0.2s;
  }

</style>
