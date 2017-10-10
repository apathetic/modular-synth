<template>
  <div
  class="filter module module--tall _3U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <!-- <slot name="interface"></slot> -->
      <knob param="freq" @value="freq = $event" :min="100" :max="12000" mode="log"></knob>
      <knob param="Q"    @value="Q = $event"    :min="0"   :max="1" :decimals="2"></knob>
      <select class="select" @mousedown.stop v-model="type">
        <option v-for="type in types" :value="type">{{ type }}</option>
      </select>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
import { Parameter } from '../audio';
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

      freq: 440,
      mod: 21,
      Q: 1,
      type: 'allpass',
      types: ['allpass', 'bandpass', 'highpass', 'highshelf', 'lowpass', 'lowshelf', 'notch', 'peaking'],

      inlets: [
        { label: 'input' },   // 0
        { label: 'cutoff' },  // 1
        { label: 'Q' },       // 2
        { label: 'mod' }      // 3
      ],

      outlets: [
        {
          label: 'output'
          // audio: null
        }
      ]
    };
  },

  created() {
    // Filter
    this.filter = this.context.createBiquadFilter();
    this.filter.type = this.types[0];
    this.filter.frequency.value = this.freq;

    // Cutoff
    // this.freq_ = new Parameter(0);

    // Q
    this.Q_ = new Parameter(this.Q);
    this.filter.Q.value = this.Q; // this.Q_;

    // Mod
    this.mod_ = new Parameter(this.mod * 500);    // range: 0-500, interval of a 5th

    // Inlets
    this.inlets[0].audio = this.filter;
    // this.inlets[1].audio = this.mod_.input;
    this.inlets[2].audio = this.Q_.input;
    this.inlets[3].audio = this.mod_.input;

    // Outlets
    this.outlets[0].audio = this.filter;

    // Connectify
    this.mod_.output.connect(this.filter.detune); // filter tremolo

    // Map k-Params
    this.$watch('freq', this.setFreq);
    this.$watch('Q', this.setQ);
    this.$watch('type', this.setType);

    console.log('%c[module] Creating Filter', 'color: blue');
  },

  methods: {
    setFreq(f) {
      this.filter.frequency.value = f;
    },

    setQ(q) {
      this.filter.Q.value = q;
    },

    setType(t) {
      console.log(t);
      this.filter.type = t || 'lowpass';
    }
  }
};

</script>

<style lang="scss">
  $grey: #a8a8a8;
  // $teal: #409d9e;
  $teal: #2c6c6d;

  .filter {
    background-image: radial-gradient(
      circle,
      $grey 0%,
      $grey  10%,
      $teal 10%,
      $teal 26%,
      $grey  26%,
      $grey  28%,
      $teal 28%,
      $teal 36%,
      $grey  36%,
      $grey  40%,
      $teal 40%,
      $teal 44%,
      $grey  44%,
      $grey  52%,
      $teal 52%,
      $teal 54%,
      $grey  54%,
      $grey  100%
    );
    background-position: 100% 66%;
    background-size: 150%;
    color: #fff;

    text {
      fill: #fff;
    }

    select {
      position: absolute;
      bottom: 22px;
      left: 33%;
    }

    .knob:first-child {
      transform: scale(1.5);
      top: 43px;
      left: -4px;
    }
  }

</style>
