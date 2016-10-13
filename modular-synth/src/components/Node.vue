<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.prevent="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      {{ position | json }}<br><br>
    </div>

    <div class="module-connections">
      <partial name="inlets"></partial>
      <partial name="outlets"></partial>
    </div>
  </div>
</template>


<script>
  import { draggable } from '../mixins/draggable';
  import { newConnection } from '../store/actions';
  import { rackWidth, rackHeight } from '../dimensions';
  import store from '../store/store'; // .... er...

  export default {
    mixins: [draggable],

    vuex: {
      actions: {
        newConnection
      }
    },

    props: {
      id: null,
      col: null,
      row: null
    },

    computed: {
      position() {
        return {
          left: (store.state.editing || this.dragging) ? this.x + 'px' : this.col * rackWidth + 'px',
          top: (store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
        };
      }
    },

    data() {
      return {
        name: 'Node',
        w: 1, // width
        h: 2, // height

        inlets: [
          {
            port: 0,
            label: 'freq',
            data: null // this.input
          },
          {
            port: 1,
            label: 'gain',
            data: null // this.input
          },
          {
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
          },
          {
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
