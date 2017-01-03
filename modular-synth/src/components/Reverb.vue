//------------------------------------------------
//  Reverb
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
      <Knob @value="feedback = value"  min="220" max="880"></Knob>
      <Knob @value="diffusion = value" min="220" max="880"></Knob>
      <Knob @value="spread = value"    min="220" max="880"></Knob>
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
      name: 'Reverb',

      inlets: [
        {
          label: 'in-1',
          data: null
        }, {
          label: 'in-2',
          data: null
        }
      ],

      outlets: [
        {
          label: 'out-1',
          data: null
        }, {
          label: 'out-2',
          data: null
        }
      ]
    };
  },

  created() {
    // inputs
    this.inlets[0].data = this.context.createGain();
    this.inlets[1].data = this.context.createGain();

    // outputs
    this.outlets[0].data = this.context.createGain();
    this.outlets[1].data = this.context.createGain();

    this.convolver = this.context.createConvolver();
  }
};

</script>
