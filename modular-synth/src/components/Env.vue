//------------------------------------------------
//  Envelope (ADSR)
// -----------------------------------------------

<template>
  <div
    class="env module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown.prevent="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <knob label="attack"  :value.sync="A" :min="0" :max="1" step="0.05"></knob>
      <knob label="decay"   :value.sync="D" :min="0" :max="1" step="0.05"></knob>
      <knob label="sustain" :value.sync="S" :min="0" :max="1" step="0.05"></knob>
      <knob label="release" :value.sync="R" :min="0" :max="1" step="0.05"></knob>
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
import { rackWidth, rackHeight } from '../dimensions';
import Knob from './UI/Knob';
import store from '../store/store'; // .... er...  this.$store...?

export default {
  mixins: [draggable],
  components: { Knob },
  vuex: {
    actions: {
      newConnection
    }
  },
  props: {
    id: null,
    col: null,
    row: null
  },
  computed: {
    position() {
      return {
        //     this.$store.state.editing
        left: (store.state.editing || this.dragging) ? this.x + 'px' : this.col * rackWidth + 'px',
        top: (store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
      };
    }
  },
  data() {
    return {
      name: 'Env',
      'A': 0.1,
      'D': 0.1,
      'S': 0.1,
      'R': 0.1,
      // velocity = 1;

      inlets: [
        {
          port: 0,
          label: 'gate',
          data: null
        }, {
          port: 1,
          label: 'mod',
          data: null
        }
      ],

      outlets: [
        {
          port: 0,
          label: 'out',
          data: null
        }
      ]
    };
  },

  created() {
    // this.inlets[0].data = this.context.createGain();  // gate. mod?

    this.outlets[0].data = this.context.createGain();
  },
  methods: {

    envGenOn(vcaGain, a, d, s) {
      const now = this.context.currentTime;
      // a *= egMode;
      // d *= egMode;
      vcaGain.cancelScheduledValues(0);
      vcaGain.setValueAtTime(0, now);
      vcaGain.linearRampToValueAtTime(1, now + a);
      vcaGain.linearRampToValueAtTime(s, now + a + d);
    },

    envGenOff(vcaGain, r) {
      const now = this.context.currentTime;
      // r *= egMode;
      vcaGain.cancelScheduledValues(0);
      vcaGain.setValueAtTime(vcaGain.value, now);
      vcaGain.linearRampToValueAtTime(0, now + r);
    }
  }
};

</script>
