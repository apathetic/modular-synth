<template>
  <div
  class="comb module _3U"
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
      name: 'Comb',

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

    console.log('Creating Comb');
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
  $grey: #a8a8a8;
  $purple: #c35896;
  .comb {
    background:
      linear-gradient(187deg,                  $purple 0%,  $purple 22%, transparent 22%) no-repeat,
      linear-gradient(192deg, transparent 22%, $purple 22%, $purple 26%, transparent 26%) no-repeat,
      linear-gradient(196deg, transparent 22%, $purple 22%, $purple 25%, transparent 25%) no-repeat,
      linear-gradient(199deg, transparent 22%, $purple 22%, $purple 24%, transparent 24%) no-repeat,
      linear-gradient(201deg, $grey 22%,       $purple 22%, $purple 23%, $grey 23%);

    background-position: 0 0, 0 5px, 100% 16px, 100% 38px, 100% 50px;
    background-size: 100%, 110%, 120%, 120%, 130%;



    color: #fff;

    text {
      color: #fff;
    }
  }
</style>
