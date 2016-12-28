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
      <Meter></Meter>
      <Meter></Meter>
      <Meter></Meter>
    </div>

    <div class="module-connections">
      <inlets ports="inlets"></inlets>
      <outlets ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
import { draggable } from '../mixins/draggable';
import Meter from './UI/Meter';

export default {
  props: { id: null },
  mixins: [draggable],
  components: { Meter },

  data() {
    return {
      name: 'Mixer',

      inlets: [
        {
          label: 'in-1',
          data: null
        }, {
          label: 'in-2',
          data: null
        }, {
          label: 'in-3',
          data: null
        }, {
          label: 'in 4',
          data: null
        }, {
          label: 'in-5',
          data: null
        }, {
          label: 'in-6',
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

  mounted() {
    // inputs
    this.inlets[0].data = this.context.createGain();
    this.inlets[1].data = this.context.createGain();
    this.inlets[2].data = this.context.createGain();
    this.inlets[3].data = this.context.createGain();
    this.inlets[4].data = this.context.createGain();
    this.inlets[5].data = this.context.createGain();

    // outputs
    this.outlets[0].data = this.context.createGain();
    this.outlets[1].data = this.context.createGain();

    // connectify
    this.inlets[0].data.connect(this.outlets[0].data);
    this.inlets[1].data.connect(this.outlets[1].data);
    this.inlets[2].data.connect(this.outlets[0].data);
    this.inlets[3].data.connect(this.outlets[1].data);
    this.inlets[4].data.connect(this.outlets[0].data);
    this.inlets[5].data.connect(this.outlets[1].data);
  }
};
</script>

<style type="sass">
  /*.mixer {
    width: 380px;
    height: 250px;
  }*/
</style>
