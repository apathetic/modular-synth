<template>
  <div
    class="mixer module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown.prevent="startDraggingNode">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <!-- <Level></Level> -->
      <!-- <Level></Level> -->
      <!-- <Level></Level> -->
    </div>

    <div class="module-connections">
      <inlets ports="inlets"></inlets>
      <outlets ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
import { draggable } from '../mixins/draggable';
// import Level from './UI/Level';

export default {
  props: { id: null },
  mixins: [draggable],
  // components: { Level },

  data() {
    return {
      name: 'Mixer',

      inlets: [
        {
          label: 'in-1'
          // audio: null
        }, {
          label: 'in-2'
          // audio: null
        }, {
          label: 'in-3'
          // audio: null
        }, {
          label: 'in 4'
          // audio: null
        }, {
          label: 'in-5'
          // audio: null
        }, {
          label: 'in-6'
          // audio: null
        }
      ],

      outlets: [
        {
          label: 'out-1'
          // audio: null
        }, {
          label: 'out-2'
          // audio: null
        }
      ]
    };
  },

  mounted() {
    // inputs
    this.inlets[0].audio = this.context.createGain();
    this.inlets[1].audio = this.context.createGain();
    this.inlets[2].audio = this.context.createGain();
    this.inlets[3].audio = this.context.createGain();
    this.inlets[4].audio = this.context.createGain();
    this.inlets[5].audio = this.context.createGain();

    // outputs
    this.outlets[0].audio = this.context.createGain();
    this.outlets[1].audio = this.context.createGain();

    // connectify
    this.inlets[0].audio.connect(this.outlets[0].audio);
    this.inlets[1].audio.connect(this.outlets[1].audio);
    this.inlets[2].audio.connect(this.outlets[0].audio);
    this.inlets[3].audio.connect(this.outlets[1].audio);
    this.inlets[4].audio.connect(this.outlets[0].audio);
    this.inlets[5].audio.connect(this.outlets[1].audio);
  }
};
</script>

<style type="sass">
  /*.mixer {
    width: 380px;
    height: 250px;
  }*/
</style>
