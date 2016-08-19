<template>
  <div
    class="mixer module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mouseover.stop="setActiveModule(id)"
    @mousedown.prevent="startDraggingNode">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <Level></Level>
      <Level></Level>
      <Level></Level>
    </div>

    <div class="module-connections">
      <partial name="inlets"></partial>
      <partial name="outlets"></partial>
    </div>
  </div>
</template>

<script>
import { draggable } from '../mixins';
import Level from './UI/Level';

export default {
  props: { id: null },
  mixins: [draggable],
  components: { Level },

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
  ready() {
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
