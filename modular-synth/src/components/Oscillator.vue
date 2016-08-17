//------------------------------------------------
//  OSCILLATOR
// -----------------------------------------------

<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mouseover.stop="setActiveModule(id)"
  @mousedown.prevent="startDraggingNode">

    <div class="module-interface">
      <select v-model="type">
        <option v-for="type in types" v-bind:value="type">{{ type }}</option>
      </select>
      <knob :value.sync="freq" :min="220" :max="880"></knob>
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="inlet in inlets"
          data-label="{{ inlet.label }}"
          class="inlet">
        </span>
      </div>

      <div class="outlets">
        <span v-for="outlet in outlets"
          @mousedown.stop="newConnection(outlet)"
          data-label="{{ outlet.label }}"
          data-port="{{ outlet.port }}"
          class="outlet">
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { draggable } from '../mixins';
import { setActiveModule, newConnection } from '../vuex/actions';
import Knob from './UI/Knob';   // audioParam

export default {
  components: { Knob },

  mixins: [draggable],

  vuex: {
    actions: {
      setActiveModule,
      newConnection
    }
  },

  props: {
    id: null
  },

  data() {
    return {
      name: 'Oscillator',
      freq: 440,
      type: 'sine',
      types: ['sine', 'square', 'sawtooth', 'triangle'],
      inlets: [
        {
          port: 0,
          label: 'freq',
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
    this.$watch('type', this.setType);

    this.$on('start', this.start);
    this.$on('stop', this.stop);      // BAD. CANNOT RESTART.
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
      // this.osc = this.context.createOscillator();   // create a new OSC every time
      this.osc.start();
    },

    stop() {
      this.osc.stop();
    }
  }
};
</script>
