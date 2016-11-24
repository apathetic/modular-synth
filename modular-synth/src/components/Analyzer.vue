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
      {{ position }}<br><br>
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
        name: 'Analyzer',
        w: 1, // width
        h: 2, // height

        inlets: [
          {
            port: 0,
            label: 'input-1',
            data: null // this.input
          }
        ]
      };
    },

    created() {
      this.inlets[0].data = this.context.createGain();
      this.analyzer = new SpectrumAnalyzer(this.inlets[0].data, 0, 100);
    }
  };

</script>
