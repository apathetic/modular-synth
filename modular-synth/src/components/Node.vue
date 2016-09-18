<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"

  @mousedown.prevent="startDragging">

  <!-- @click="setSelected(id)" -->
  <!-- @mouseover="setActiveModule(id)" -->

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <!--<slot></slot> -->

      {{ position | json }}<br><br>

      col: {{ col }}<br>
      row: {{ row }}<br>
      w: {{ w }}<br>
      h: {{ h }}<br>

      x: {{ x }}<br>
      y: {{ y }}<br>

      left: {{ left }}<br>
      right: {{ right }}

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
import { newConnection } from '../vuex/actions';
import store from '../vuex/store'; // .... er...

export default {
  mixins: [draggable],

  vuex: {
    vuex: {
      getters: {
        editing: state => state.editing
      }
    },
    actions: {
      newConnection
    }
  },

  props: {
    id: null,
    x: null,
    y: null,
    col: null,
    row: null
  },

  computed: {
    position() {
      return {
        left: (store.state.editing || this.dragging) ? this.x + 'px' : this.col * 240 + 'px',
        top: (store.state.editing || this.dragging) ? this.y + 'px' : this.row * 240 + 'px'

        // SORTABLE:
        // left: this.col * "cellWidth" + 'px',
        // top: this.top + 'px'

        // DRAGGABLE:
        // left: this.x + 'px',
        // top: this.y + 'px'

      };
    }
  },

  data() {
    return {
      name: 'Node',

      // width: 240,
      // height: 240,

      w: 1,
      h: 2,


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
    height: 200px;
    width: 200px;
    border: 1px solid #fff;
    position: absolute;
    // transition: height 0.2s, width 0.2s;
    transition: all 0.2s;
    transition-timing-function: ease-in-out;
    z-index: 1;

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
      //
      transition: none;
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
      width: 240px !important;
      height: 240px !important;

      transition-delay: 0.2s;
    }
    .module-connections {
      display: none;
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
</style>
