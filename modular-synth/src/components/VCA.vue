//------------------------------------------------
//  Envelope
// -----------------------------------------------

<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.prevent="startDraggingNode">
  <!-- @mousedown.prevent="dragStart($event, this)"> -->

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <slot name="interface"></slot>
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="(inlet, index) in inlets"
          :data-label="inlet.label"
          :data-port="index"
          class="inlet">
        </span>
      </div>

      <div class="outlets">
        <span v-for="(outlet, index) in outlets"
          @mousedown.stop="newConnection(outlet)"
          :data-label="outlet.label"
          :data-port="index"
          class="outlet">
        </span>
      </div>
    </div>
  </div>
</template>


<script>
import { draggable } from '../mixins';
import { newConnection } from '../store/actions';

export default {
  mixins: [draggable],

  vuex: {
    actions: {
      newConnection
    }
  },

  props: {
    id: null
  },

  data() {
    return {
      name: 'Node',

      inlets: [
        {
          port: 0,
          label: 'freq',
          data: this.input
        }, {
          port: 1,
          label: 'gain',
          data: null // this.input
        }, {
          port: 2,
          label: 'range',
          data: null // this.input
        }
      ],

      outlets: [
        {
          port: 0,
          label: 'output-1',
          data: null // this.outputL   // src?
        }, {
          port: 1,
          label: 'output-2',
          data: null // this.outputR
        }
      ]
    };
  },

  created() {
    // dummy outlet for test
    this.inlets[0].data = this.context.createGain();

    this.outlets[0].data = this.context.createGain();
    this.outlets[1].data = this.context.createGain();
  }
};

</script>
