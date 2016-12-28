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

      <knob label="freq"  @value="freq = value"  min="0" max="20"></knob>
      <knob label="phase" @value="phase = value" min="0" max="3.14159265"></knob>

    </div>

    <div class="module-connections">
      <inlets ports="inlets"></inlets>
      <outlets ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
import { draggable } from '../mixins/draggable';
import { newConnection } from '../store/actions';
import { rackWidth, rackHeight } from '../dimensions';
import Knob from './UI/Knob';   // audioParam
import store from '../store/store'; // .... er...  this.$store...?

export default {
  mixins: [draggable],
  components: { Knob },
  vuex: {
    actions: {
      newConnection
    }
  },
  computed: {
    position() {
      return {
        //     this.$store.state.editing
        left: (store.state.editing || this.dragging) ? this.x + 'px' : this.col * rackWidth + 'px',
        top: (store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
      };
    }
  },

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
      type: 'sine',
      types: ['sine', 'square', 'sawtooth', 'triangle'],
      inlets: [
        {
          port: 0,
          label: 'gate',    // mod?
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
    const osc = this.context.createOscillator();

    this.outlets[0].data = osc;

    osc.type = this.type;
    osc.frequency.value = this.freq;
    osc.start();

    this.$watch('freq', this.setFreq);
    // this.$watch('depth', this.setDepth);   // gate. mod?
    this.$watch('type', this.setType);
  },

  methods: {
    setFreq(f) {
      // this.osc.frequency.value = f;
      this.outlets[0].data.frequency.value = f;
    },

    setType(t) {
      // this.osc.type = t;
      this.outlets[0].data.type = t;
    }
  }
};
</script>
