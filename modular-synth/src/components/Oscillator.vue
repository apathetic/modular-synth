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

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <select v-model="type">
        <option v-for="type in types" v-bind:value="type">{{ type }}</option>
      </select>
      <knob :value.sync="freq" :min="220" :max="880"></knob>
      <knob :value.sync="sync" :min="0" :max="1"></knob>
      <knob :value.sync="PW" :min="0" :max="6.28"></knob>
    </div>

    <div class="module-connections">
      <partial name="inlets"></partial>
      <partial name="outlets"></partial>
    </div>
  </div>
</template>

<script>
import { draggable } from '../mixins/draggable';
import { setActiveModule, newConnection } from '../vuex/actions';
import Knob from './UI/Knob';   // audioParam

export default {
  props: { id: null },
  components: { Knob },
  mixins: [draggable],

  vuex: {
    actions: {
      setActiveModule,
      newConnection
    }
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
        },
        {
          port: 0,
          label: 'sync',
          data: null
        },
        {
          port: 0,
          label: 'mod-A',
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


    this.inlets[0].data = this.osc.frequency;


    this.$watch('freq', this.setFreq);
    this.$watch('type', this.setType);

    this.$on('start', this.start);
    this.$on('stop', this.stop);      // BAD. CANNOT RESTART.
  },

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
