<template>
  <div
  class="module _2U"
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
          // audio: null
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
    this.inlets[0].audio = this.outlets[0].audio = this.context.createGain();
    this.inlets[1].audio = this.outlets[0].audio.gain;

    console.log('Creating VCA');
  }
};

</script>

<style lang="scss">
  .env {
    background: linear-gradient(to bottom, #383633 0%, #32312e 98%, #242320 100%);
    color: #fff;

    .knob {
      fill: #fff;
    }
  }
</style>
