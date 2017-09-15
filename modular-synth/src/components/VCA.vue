<template>
  <div
  class="vca module _2U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      VCA
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
import { draggable } from '../mixins/draggable';

export default {
  mixins: [draggable],
  props: {
    id: null,
    col: null,
    row: null
  },

  data() {
    return {
      name: 'VCA',
      inlets: [
        {
          label: 'signal'
          // audio: null,
          // data: null
        }, {
          label: 'gain'
          // audio: null
        }
      ],

      outlets: [
        {
          label: 'output'
          // audio: null
        }
      ]
    };
  },

  created() {
    const vca = this.context.createGain();
    vca.gain.value = 0; // IMPORTANT. Set ORIGINAL gain value i.e. "offset"... which is what is ADDED into future signals. I Think...???
                        // If this is not set, than any signal in will... be additive to itself, or ...something
    this.inlets[0].audio = vca;
    this.inlets[1].audio = vca.gain;

    this.outlets[0].audio = vca;

    console.log('Creating VCA');
  },

  destroyed() {
    // this.inlets[0].audio.disconnect(); // this is done in Connection
  }
};

</script>

<style lang="scss">
  .vca {
    background: linear-gradient(to bottom, #242320 0%, #181310 98%, #101310 100%);
    color: #fff;

    .knob {
      fill: #fff;
    }
  }
</style>
