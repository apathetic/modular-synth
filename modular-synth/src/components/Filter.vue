<template>
  <div
  class="filter module _2U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <!-- <slot name="interface"></slot> -->
      <knob label="freq" @value="freq = $event" :min="100" :max="20000" log="1"></knob>
      <knob label="Q"    @value="Q = $event"    :min="0" :max="1" :decimals="2"></knob>
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
        {
          label: 'input'
          // audio: null
        }, {
          label: 'freq'
          // audio: null // this.input
        }
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
  .filter {
    background: linear-gradient(to bottom, #484643 0%, #42413e 98%, #343330 100%);
    // $grey: #a8a8a8;
    // $purple: #c35896;
    // background:
    //   linear-gradient(187deg,                  $purple 0%,  $purple 22%, transparent 22%) no-repeat,
    //   linear-gradient(192deg, transparent 22%, $purple 22%, $purple 26%, transparent 26%) no-repeat,
    //   linear-gradient(196deg, transparent 22%, $purple 22%, $purple 25%, transparent 25%) no-repeat,
    //   linear-gradient(199deg, transparent 22%, $purple 22%, $purple 24%, transparent 24%) no-repeat,
    //   linear-gradient(201deg, $grey 22%,       $purple 22%, $purple 23%, $grey 23%);
    //
    // background-position: 0 0, 0 5px, 100% 16px, 100% 38px, 100% 50px;
    // background-size: 100%, 110%, 120%, 120%, 130%;
    //

    color: #fff;

    text {
      fill: #fff;
    }

    // .track {
    //   stroke: #333;
    // }
  }

</style>
