<template>
  <div
    class="module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown="startDraggingNode">

    <div class="module-interface">
      <h3>Node - {{ idx }}</h3>
      x:{{ x }}
      y:{{ y }}

      <input id="masterOut1" type="range" min="0.0" max="1.0" step="0.1" value="0.0" />
      <input id="masterOut2" type="range" min="0.0" max="1.0" step="0.1" value="0.0" />
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="inlet in inlets"
          data-label="{{ inlet.label }}"
          class="inlet">
        </span>
      </div>
    </div>
</template>

<script>
import {draggable} from '../mixins';

export default {
  mixins: [draggable],

  data() {
    return {
      name: 'Master Out',
      inlets: [
        {
          label: 'out-L',
          data: this.outL,  // to
          connections: []
        }, {
          label: 'out-R',
          data: this.outR,  // to
          connections: []
        }
      ]
    };
  },
  ready() {
    this.outL = this.context.createGain();
    this.outR = this.context.createGain();

    this.outL.connect(this.context.destination);
    this.outR.connect(this.context.destination);

    var e = this.$el;

    e.id = 'module-' + this.idx;
    e.style.left = '200px';
    e.style.top = '200px';
  }
};
</script>
