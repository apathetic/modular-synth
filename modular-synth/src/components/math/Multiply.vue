<template>
  <div
    class="multiply module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown="startDraggingNode">

    <div class="module-interface">
      <h3>multiply</h3>
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="inlet in inlets"
          :data-label="inlet.label"
          class="inlet">
        </span>
      </div>
      <div class="outlets">
        <span v-for="outlet in outlets"
          :data-label="outlet.label"
          class="outlet">
        </span>
      </div>
    </div>
</template>

<script>
import {draggable} from '../mixins';
import Level from './UI/Level';

export default {
  mixins: [draggable],
  components: {Level},

  data() {
    return {
      name: 'Master Out',
      inlets: [
        {
          label: 'in 1',
          data: this.in1,  // to
          connections: []
        },
        {
          label: 'in 2',
          data: this.in2,  // to
          connections: []
        }
      ],
      outlets: [
        {
          label: 'out',
          data: this.out,  // to
          connections: []
        }
      ]
    };
  },

  mounted() {
    this.in1 = this.context.createGain();
    this.in2 = this.context.createGain();
    this.out = this.context.createGain();

    this.in1.connect(this.out);
    this.in2.connect(this.out.gain);

    var e = this.$el;

    e.id = 'module-' + this.idx;
    e.style.left = '200px';
    e.style.top = '200px';
  }
};
</script>
