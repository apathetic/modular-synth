<template>
  <div
  class="compressor module _3U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      ....
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
import { draggable } from '../mixins/draggable';
import Knob from './UI/Knob';

export default {
  mixins: [ draggable ],
  components: { Knob },
  props: {
    id: null,
    col: null,
    row: null
  },

  data() {
    return {
      name: 'Compressor',

      inlets: [
        { label: 'input' }
      ],
      outlets: [
        { label: 'output' }
      ]
    };
  },

  created() {
    this.inlets[0].audio = this.input = this.context.createGain();
    this.outlets[0].audio = this.output = this.context.createGain();

    console.log('%c[component] Creating Compressor', 'color: blue');
  },

  destroyed() {
  },

  methods: {
  }
};

</script>

<style lang="scss">
  .compressor {
  }
</style>
