<template>
  <div
    class="mixer module module--tall _4U"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <knob param="gain_1" @value="gain_1 = $event" :min="0" :max="100"></knob>
      <knob param="gain_2" @value="gain_2 = $event" :min="0" :max="100"></knob>
      <knob param="gain_3" @value="gain_3 = $event" :min="0" :max="100"></knob>
      <knob param="gain_4" @value="gain_4 = $event" :min="0" :max="100"></knob>
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
      'gain_1': 0,
      'gain_2': 0,
      'gain_3': 0,
      'gain_4': 0,

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
      //   transform: scale(1.5);
      // }

      fill: #fff;

      &:nth-child(1) { top: 44%; }
      &:nth-child(2) { left: 40%; }
      &:nth-child(3) { top: 44%; right: 10%; }
      &:nth-child(4) { bottom: 3%; left: 40%; }
    }
  }
</style>
