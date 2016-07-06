//------------------------------------------------
//  OSCILLATOR
// -----------------------------------------------

<template>
  <div
    class="module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown="startDraggingNode">

    <div class="module-interface">
      <select v-model="type">
        <option v-for="type in types" v-bind:value="type">{{ type }}</option>
      </select>
      <knob :value.sync="freq" :min="220" :max="880"></knob>
    </div>

    <div class="module-connections">
      <div class="outlets">
        <span v-for="outlet in outlets"
          @mousedown.stop="createConnector($event, outlet)"
          data-label="{{ outlet.label }}"
          class="outlet">
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import {draggable} from '../mixins';
import Knob from './UI/Knob';   // audioParam

export default {
  mixins: [draggable],
  components: {Knob},
  data() {
    return {
      name: 'Oscillator',
      freq: 440,
      type: 'sine',
      types: ['sine', 'square', 'sawtooth', 'triangle'],

      outlets: [
        {
          label: 'outputL',
          data: this.output,   // to: this.output?
          connections: []
        }
      ]
    };
  },

  created() {
    // Our lovely webAudio Oscillator.
    this.osc = this.context.createOscillator();
    this.osc.type = this.type;
    this.osc.frequency.value = this.freq;

    this.output = this.context.createGain();
    this.osc.connect(this.output);

    this.$watch('freq', this.setFreq);
    this.$watch('type', this.setType);

    this.$on('start', this.start);
    this.$on('stop', this.stop);      // BAD. CANNOT RESTART.
  },

  computed: {},

  methods: {
    createConnector(event, outlet) {
      // ///
      this.output.connect(this.context.destination);

      this.$dispatch('connector:new', {
        module: this,
        label: outlet.label,
        data: this.output,    // outlet.data,
        port: event.target,
        connections: outlet.connections
      });
    },

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

