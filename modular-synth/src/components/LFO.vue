//------------------------------------------------
//  LFO
// -----------------------------------------------

<template>
  <div
  class="lfo module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.prevent="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <select v-model="type">
        <option v-for="type in types" v-bind:value="type">{{ type }}</option>
      </select>

      <knob label="freq"  @value="freq = $event"  min="0" max="20"></knob>
      <knob label="phase" @value="phase = $event" min="0" max="3.14159265"></knob>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
import { draggable } from '../mixins/draggable';
import Knob from './UI/Knob';   // audioParam

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
      name: 'LFO',
      w: 1, // rack width
      h: 1, // rack height
      freq: 2.0,
      min: 0.1,
      max: 10,
      phase: 0,
      type: 'sine',
      types: ['sine', 'square', 'sawtooth', 'triangle'],
      inlets: [
        {
          label: 'gate',    // mod?
          data: null
        }
      ],
      outlets: [
        {
          label: 'output',
          data: null
        }
      ]
    };
  },

  created() {
    // const osc = this.context.createOscillator();
    //
    // this.outlets[0].data = osc;
    // osc.type = this.type;
    // osc.frequency.value = this.freq;
    // osc.start();


    this.outlets[0].data = this.osc = this.context.createOscillator();

    this.osc.type = this.type;
    this.osc.frequency.value = this.freq;
    this.osc.start();

    this.$watch('freq', this.setFreq);
    // this.$watch('depth', this.setDepth);   // gate. mod?
    this.$watch('type', this.setType);
  },

  methods: {
    setFreq(f) {
      this.osc.frequency.value = f;
      // this.outlets[0].data.frequency.value = f;
    },

    setType(t) {
      this.osc.type = t;
      // this.outlets[0].data.type = t;
    }
  }
};
</script>
