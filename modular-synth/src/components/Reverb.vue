//------------------------------------------------
//  Reverb
// -----------------------------------------------

<template>
  <div
  class="reverb module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <knob @value="feedback = $event"  min="220" max="880"></knob>
      <knob @value="diffusion = $event" min="220" max="880"></knob>
      <knob @value="spread = $event"    min="220" max="880"></knob>
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
      seconds: 3,
      decay: 2,
      reverse: false,

      inlets: [
        {
          label: 'input',
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
    const reverb = this.convolver = this.context.createConvolver();

    // inputs
    this.inlets[0].data = reverb;
    this.outlets[0].data = reverb;


    console.log('Creating Oscillator');
  }
};

</script>

<style lang="scss">
  .reverb {
    // background: linear-gradient(top bottom, #d3cab9 0%, #d3cab9 95%, #8a8478 100%);

    background: linear-gradient(to bottom, #e6dcce 0%, #c9c1b0 98%, #8a8478 100%);


    // background: #d3cab9;
    color: #000;

    text {
      color: #000;
    }
  }
</style>
