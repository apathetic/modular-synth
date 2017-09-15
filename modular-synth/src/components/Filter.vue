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
      <knob param="freq" @value="freq = $event" :min="100" :max="20000" log="1"></knob>
      <knob param="Q"    @value="Q = $event"    :min="0" :max="1" :decimals="2"></knob>
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
      type: 'allpass',
      types: ['allpass', 'bandpass', 'highpass', 'highshelf', 'lowpass', 'lowshelf', 'notch', 'peaking'],
      Q: 1,

      inlets: [
        { label: 'input' },
        { label: 'freq' },
        { label: 'cutoff' },
        { label: 'res' }
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
    this.filter = this.context.createBiquadFilter();
    this.filter.type = this.types[0];
    this.filter.frequency.value = this.freq;
    this.filter.Q.value = this.Q;

    this.inlets[0].audio = this.filter;
    this.outlets[0].audio = this.filter;

    this.$watch('freq', this.setFreq);
    this.$watch('Q', this.setQ);
    this.$watch('type', this.setType);

    console.log('Creating Filter');
  },

  // destroyed() {
  //   this.filter.disconnect();
  // },

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
  $teal: #409d9e;

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
