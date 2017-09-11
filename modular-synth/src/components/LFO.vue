//------------------------------------------------
//  LFO
// -----------------------------------------------

<template>
  <div
  class="lfo module _2U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.prevent="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <select class="select" @mousedown.stop v-model="type">
        <option v-for="type in types" :value="type">{{ type }}</option>
      </select>

      <knob param="freq"  @value="freq = $event"  :min="0" :max="20"></knob>
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
      freq: 2.0,
      min: 0.1,
      max: 10,
      phase: 0,
      type: 'sine',
      types: ['sine', 'square', 'sawtooth', 'triangle'],
      inlets: [
        { label: 'mod' },
        { label: 'sync' }
      ],
      outlets: [
        { label: 'output' }
      ]
    };
  },

  created() {
    this.outlets[0].audio = this.osc = this.context.createOscillator();

    this.osc.type = this.type;
    this.osc.frequency.value = this.freq;
    this.osc.start();

    this.$watch('freq', this.setFreq);
    // this.$watch('depth', this.setDepth);   // gate. mod?
    this.$watch('type', this.setType);

    console.log('Creating LFO');
  },

  // destroyed() {
  //   this.osc.disconnect();
  // },

  methods: {
    setFreq(f) {
      this.osc.frequency.value = f;
    },

    setType(t) {
      this.osc.type = t;
    }
  }
};
</script>

<style lang="scss">
  .lfo {
    background: linear-gradient(to bottom, #f2efed 0%,#d9d7d5 98%,#959492 100%);
    color: #000;
  }
</style>
