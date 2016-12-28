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
      <knob label="attack"  @value="A = value" min="0" max="1" step="0.05"></knob>
      <knob label="decay"   @value="D = value" min="0" max="1" step="0.05"></knob>
      <knob label="sustain" @value="S = value" min="0" max="1" step="0.05"></knob>
      <knob label="release" @value="R = value" min="0" max="1" step="0.05"></knob>
    </div>

    <div class="module-connections">
      <inlets ports="inlets"></inlets>
      <outlets ports="outlets"></outlets>
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

      w: 1, // rack width
      h: 1, // rack height

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
    // Generate (mono) buffer with 2 samples
    const buffer = this.context.createBuffer(1, 2, this.context.sampleRate);
    const source = this.context.createBufferSource();

    // set each sample to 1
    buffer.getChannelData(0)[0] = 1;
    buffer.getChannelData(0)[1] = 1;

    // var data = buffer.getChannelData(0);
    // data[0] = 1;
    // data[1] = 1;
    //
    // bind source for the buffer, looping it
    source.buffer = buffer;
    source.loop = true;

    this.voltage = source;


    // this.inlets[0].data = this.context.createGain();  // gate?
    // this.inlets[1].data = this.context.createGain();  // mod?

    this.adsr = this.context.createGain();
    this.outlets[0].data = this.adsr;
  },
  methods: {

    start(when) {
      var attackRampMethodName = this._getRampMethodName('attack');
      var decayRampMethodName = this._getRampMethodName('decay');

      var attackStartsAt = when + this.settings.delayTime;
      var attackEndsAt = attackStartsAt + this.settings.attackTime;
      var decayStartsAt = attackEndsAt + this.settings.holdTime;
      var decayEndsAt = decayStartsAt + this.settings.decayTime;
      var attackStartLevel = (attackRampMethodName === 'exponentialRampToValueAtTime') ? 0.001 : 0;

      this.adsr.gain.setValueAtTime(attackStartLevel, when);
      this.adsr.gain.setValueAtTime(attackStartLevel, attackStartsAt);
      this.adsr.gain[attackRampMethodName](1, attackEndsAt);
      this.adsr.gain.setValueAtTime(1, decayStartsAt);
      this.adsr.gain[decayRampMethodName](this.settings.sustainLevel, decayEndsAt);

      this.source.start(when);
    },

    envGenOn(vcaGain, a, d, s) {
      const now = this.context.currentTime;

      vcaGain.cancelScheduledValues(0);
      vcaGain.setValueAtTime(0, now);
      vcaGain.linearRampToValueAtTime(1, now + a);
      vcaGain.linearRampToValueAtTime(s, now + a + d);
    },

    envGenOff(vcaGain, r) {
      const now = this.context.currentTime;

      vcaGain.cancelScheduledValues(0);
      vcaGain.setValueAtTime(vcaGain.value, now);
      vcaGain.linearRampToValueAtTime(0, now + r);
    }
  }
};

</script>
