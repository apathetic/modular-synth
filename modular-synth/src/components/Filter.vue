<template>
  <div
  class="filter module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <!-- <slot name="interface"></slot> -->
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
  mixins: [draggable],
  components: { Knob },
  props: {
    id: null,
    col: null,
    row: null
  },

  data() {
    return {
      name: 'Filter',
      // w: 1, // rack width
      // h: 1, // rack height

      freq: 440,
      types: ['lowpass', 'hipass', 'bandpass', 'notch'],
      Q: 1,

      inlets: [
        {
          label: 'input',
          data: null
        }, {
          label: 'input',
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
    this.filter = this.context.createBiquadFilter();
    this.filter.type = this.types[0];
    this.filter.frequency.value = this.freq;
    this.filter.Q.value = this.Q;

    // connect input to our filter
    this.inlets[0].data = this.filter;
    this.outlets[0].data = this.filter;

    // this.$watch('type', this.setReverb);
    // this.$watch('freq', this.setDecay);
    // this.$watch('Q', this.setDecay);

    console.log('Creating Filter');
  },

  methods: {
    setFreq(f) {
      this.filter.frequency.value = f;
    },

    setType(t) {
      this.filter.type = this.types[t] || 'lowpass';
    }
  }
};

</script>

<style lang="scss">
  .filter {
    background: linear-gradient(to bottom, #484643 0%, #42413e 98%, #343330 100%);
    color: #fff;

    text {
      color: #fff;
    }
  }
</style>
