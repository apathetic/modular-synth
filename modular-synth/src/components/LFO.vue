//------------------------------------------------
//  LFO
// -----------------------------------------------

<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.prevent="startDraggingNode">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <knob :value.sync="freq" :min="0" :max="20"></knob>
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
import Knob from './UI/Knob';   // audioParam

export default {
  props: { id: null },
  components: { Knob },
  mixins: [draggable],

  vuex: {
    actions: {
      newConnection
    }
  },

  data() {
    return {
      name: 'LFO',
      freq: 2.0,
      type: 'sine',
      types: ['sine', 'square', 'sawtooth', 'triangle'],
      inlets: [
        {
          port: 0,
          label: 'gate',
          data: null
        }
      ],
      outlets: [
        {
          port: 0,
          label: 'output',
          data: null
        }
      ]
    };
  },

  created() {
    // this.inlets[0].data = this.context.createGain();
    this.outlets[0].data = this.context.createGain();

    // Our lovely webAudio Oscillator.
    this.osc = this.context.createOscillator();
    this.osc.type = this.type;
    this.osc.frequency.value = this.freq;
    this.osc.connect(this.outlets[0].data);

    this.$watch('freq', this.setFreq);
    this.$watch('depth', this.setDepth);
    this.$watch('type', this.setType);

    // this.$on('start', this.start);
    // this.$on('stop', this.stop);      // BAD. CANNOT RESTART.
  },

  methods: {
    setFreq(f) {
      this.osc.frequency.value = f;
    },

    setDepth(d) {
      this.outlets[0].gain.value = d;
    },

    setType(t) {
      this.osc.type = t;
    },

    start() {
      // this.osc = this.context.createOscillator();   // create a new OSC every time
      this.osc.start();
    },

    stop() {
      this.osc.stop();
    }
  }
};
</script>
