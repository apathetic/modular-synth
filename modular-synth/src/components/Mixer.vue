<template>
  <div
    class="mixer module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown="startDraggingNode">

    <div class="module-interface">
      <h3>Mixer</h3>
      <Level></Level>
      <Level></Level>
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="inlet in inlets"
          data-label="{{ inlet.label }}"
          class="inlet">
        </span>
      </div>
      <div class="outlets">
        <span v-for="outlet in outlets"
          @mousedown.stop="createConnector($event, outlet)"
          data-label="{{ outlet.label }}"
          class="outlet">
        </span>
      </div>
    </div>
</template>

<script>
import {draggable} from '../mixins';
import Level from './UI/Level';

export default {
  mixins: [draggable],
  components: {Level},

  data() {
    return {
      name: 'Mixer',

      inlets: [
        {
          label: 'in 1L',
          data: this.in1L,  // to
          connections: []
        }, {
          label: 'in 1R',
          data: this.in1R,  // to
          connections: []
        },
        {
          label: 'in 2L',
          data: this.in2L,  // to
          connections: []
        }, {
          label: 'in 2R',
          data: this.in2R,  // to
          connections: []
        },
        {
          label: 'in 3L',
          data: this.in3L,  // to
          connections: []
        }, {
          label: 'in 3R',
          data: this.in3R,  // to
          connections: []
        }
      ],

      outlets: [
        {
          label: 'out L',
          data: this.outL,  // to
          connections: []
        }, {
          label: 'out R',
          data: this.outR,  // to
          connections: []
        }
      ]
    };
  },
  ready() {
    this.in1L = this.context.createGain();
    this.in1R = this.context.createGain();
    this.in2L = this.context.createGain();
    this.in2R = this.context.createGain();
    this.in3L = this.context.createGain();
    this.in3R = this.context.createGain();

    this.outL = this.context.createGain();
    this.outR = this.context.createGain();

    this.in1L.connect(this.outL);
    this.in1R.connect(this.outR);
    this.in2L.connect(this.outL);
    this.in2R.connect(this.outR);
    this.in3L.connect(this.outL);
    this.in3R.connect(this.outR);

    var e = this.$el;

    e.id = 'module-' + this.idx;
    e.style.left = '200px';
    e.style.top = '200px';
  }
};
</script>

<style type="sass">
  .mixer {
    width: 380px;
    height: 250px;
  }
</style>