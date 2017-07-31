<template>
  <div
  class="reverb module _3U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <knob param="seconds" @value="seconds = $event" :min="0" :max="5"></knob>
      <knob param="decay" @value="decay = $event"     :min="0" :max="5"></knob>
    </div>

    <div class="module-connections">
      <inlets  :ports="inlets"></inlets>
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

      inlets: [
        {
          label: 'input-1'
        },
        {
          label: 'input-2'
        }
      ],

      outlets: [
        {
          label: 'output-1'
        },
        {
          label: 'output-2'
        }
      ]
    };
  },

  created() {
    const reverb = this.convolver = this.context.createConvolver();

    // inputs
    this.inlets[0].audio = reverb;
    this.outlets[0].audio = reverb;

    this.$watch('seconds', this.setReverb);
    this.$watch('decay', this.setDecay);

    console.log('Creating Reverb');
  },

  // destroyed() {
  //   this.convolver.disconnect();
  // },

  methods: {
    /**
     * k-rate control of the Reverb
     * @param  {Float} s reverb in seconds
     */
    setReverb(s) {
      // this.convolver.reverb.value = s;
    },

    /**
     * k-rate control of the Reverb decay
     * @param  {Float} d decay in seconds
     */
    setDecay(d) {
      // this.convolver.decay.value = d;
    }
  }
};

</script>

<style lang="scss">
  .reverb {
    background: linear-gradient(to bottom, #e6dcce 0%, #c9c1b0 98%, #8a8478 100%);
    color: #000;

    text {
      color: #000;
    }
  }
</style>
