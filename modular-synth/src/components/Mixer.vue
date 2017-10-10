<template>
  <div
    class="mixer module module--tall _3U"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <knob param="one"   @value="one = $event"   :min="0" :max="100"></knob>
      <knob param="two"   @value="two = $event"   :min="0" :max="100"></knob>
      <knob param="three" @value="three = $event" :min="0" :max="100"></knob>
      <knob param="four"  @value="four = $event"  :min="0" :max="100"></knob>
    </div>

    <div class="module-connections">
      <inlets  :ports="inlets"></inlets>
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
      name: 'Mixer',
      'one': 0,
      'two': 0,
      'three': 0,
      'four': 0,

      inlets: [
        { label: 'in-1' },
        { label: 'in-2' },
        { label: 'in-3' },
        { label: 'in 4' }
      ],
      outlets: [
        { label: 'out-1' }
      ]
    };
  },

  mounted() {
    // inputs
    this.inlets[0].audio = this.context.createGain();
    this.inlets[1].audio = this.context.createGain();
    this.inlets[2].audio = this.context.createGain();
    this.inlets[3].audio = this.context.createGain();

    // outputs
    this.outlets[0].audio = this.context.createGain();

    // connectify
    this.inlets[0].audio.connect(this.outlets[0].audio);
    this.inlets[1].audio.connect(this.outlets[0].audio);
    this.inlets[2].audio.connect(this.outlets[0].audio);
    this.inlets[3].audio.connect(this.outlets[0].audio);
  },

  methods: {
    // update() {
    //   numConnected = 1; // how many active connections
    //   this.outlets[0].audio.gain.value = 1 / numConnected;
    // }
  }
};
</script>

<style lang="scss">
  $xxx: #333;
  .mixer {
    background:
      linear-gradient(45deg, $xxx 0%, $xxx 48%, transparent 48%) no-repeat,
      linear-gradient(135deg, transparent 52%, $xxx 52%, transparent 100%);

    // color: #000;

    .knob {
      position: absolute;

      // path {
      transform: scale(1.2);
      // }

      fill: #fff;

      &:nth-child(1) { top: 44%; }
      &:nth-child(2) { left: 40%; }
      &:nth-child(3) { top: 44%; right: 10%; }
      &:nth-child(4) { bottom: 3%; left: 40%; }
    }
  }
</style>
