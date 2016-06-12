//------------------------------------------------
//  OSCILLATOR
// -----------------------------------------------

<template>
  <div class="module" @mousedown="startDraggingNode">
    <inputs></inputs>
    <div class="interface">
      <select v-model="type">
        <option v-for="type in types" v-bind:value="type">{{ type }}</option>
      </select>
      <knob :value.sync="freq" :min="220" :max="880"></knob>
    </div>
  </div>
</template>

<script>
import {draggable} from '../mixins';
import Knob from './UI/Knob';

export default {
  mixins: [draggable],
  components: {
    Knob
  },

  data() {
    return {
      freq: 440,
      type: 'sine',
      types: ['sine', 'square', 'sawtooth', 'triangle', 'custom']
    };
  },

  created() {
    // Our lovely webAudio Oscillator.
    this.osc = this.context.createOscillator();
    this.osc.type = this.type;
    this.osc.frequency.value = this.freq;

    this.output = this.context.createGain();
    this.osc.connect(this.output);

    // $vm.output.connect($vm.context.destination)

    this.$watch('freq', this.setFreq);
    this.$watch('type', this.setType);
  },

  computed: {},

  methods: {
    /**
     * k-rate control of the Oscillator frequency
     * @param  {Float} f frequency
     */
    setFreq(f) {
      this.osc.frequency.value = f;
    },

    /**
     * Update wave type
     * @param  {String} t One of the pre-defined oscillator wave types
     */
    setType(t) {
      this.osc.type = t;
    },

    start() {
      this.osc.start();
    },

    stop() {
      this.osc.stop();
    }
  }
};
</script>

