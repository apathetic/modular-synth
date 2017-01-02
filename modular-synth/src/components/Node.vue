<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      {{ position }}<br><br>
      x {{ x }}<br>
      y {{ y }}<br>
      col {{ col }}<br>
      row {{ row }}<br>
      {{ position.left }}<br>
      {{ dragging }}<br>
      edit: {{ $store.state.editing }}
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
  import { draggable } from '../mixins/draggable';
  // import { newConnection } from '../store/actions';
  // import { rackWidth, rackHeight } from '../dimensions';
  // import store from '../store/store'; // .... er...

  export default {
    mixins: [draggable],
    props: {
      id: null,
      col: null,
      row: null
    },

    data() {
      return {
        name: 'Node',
        w: 1, // width
        h: 1, // height

        inlets: [
          {
            label: 'freq',
            data: null // this.input
          },
          {
            label: 'gain',
            data: null // this.input
          },
          {
            label: 'range',
            data: null // this.input
          }
        ],

        outlets: [
          {
            label: 'output-1',
            data: null // this.outputL   // src?
          },
          {
            // port: 1,
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
