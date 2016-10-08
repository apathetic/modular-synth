<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.prevent="startDraggingNode">
  <!-- @mousedown.prevent="dragStart($event, this)"> -->

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <slot name="interface"></slot>
    </div>

    <!-- @mouseup.stop="updateConnection_(inlet)" -->
    <div class="module-connections">
      <partial name="inlets"></partial>
      <partial name="outlets"></partial>
    </div>
  </div>
</template>


<script>
import { draggable } from '../mixins/draggable';
import { newConnection } from '../store/actions';
import Knob from './UI/Knob';

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
      name: 'Filter',
      freq: 440,
      types: ['lowpass', 'hipass', 'bandpass', 'notch'],
      Q: 1,

      inlets: [
        {
          port: 0,
          label: 'in-1',
          data: this.input
        }, {
          port: 1,
          label: 'in-2',
          data: null // this.input
        }
      ],

      outlets: [
        {
          port: 0,
          label: 'output-1',
          data: null // this.outputL   // src?
        }, {
          port: 1,
          label: 'output-2',
          data: null // this.outputR
        }
      ]
    };
  },

  created() {
    // inputs
    this.inlets[0].data = this.context.createGain();


    // create the filter
    this.filter = this.context.createBiquadFilter();
    this.filter.type = this.types[0];
    this.filter.frequency.value = this.freq;
    this.filter.Q.value = this.Q;

    // connect input to our filter
    this.inlets[0].data.connect(this.filter);
  },

  methods: {
    setFreq(f) {
      this.filter.frequency.value = f;
    },

    setType(t) {
      this.filter.type = this.types[t] || 'lowpass';
    }
  }
};

</script>
