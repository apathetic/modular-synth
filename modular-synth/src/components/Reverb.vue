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
      <Knob @value="feedback = value" :min="220" :max="880"></Knob>
      <Knob @value="diffusion = value" :min="220" :max="880"></Knob>
      <Knob @value="spread = value" :min="220" :max="880"></Knob>
    </div>

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
      name: 'Reverb',

      inlets: [
        {
          port: 0,
          label: 'in-1',
          data: null
        }, {
          port: 1,
          label: 'in-2',
          data: null
        }
      ],

      outlets: [
        {
          port: 0,
          label: 'out-1',
          data: null
        }, {
          port: 1,
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
