//------------------------------------------------
//  Envelope (ADSR)
// -----------------------------------------------

<template>
  <div
    class="env module _3U"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <knob label="attack"  @value="A = value" :min="0" :max="1"></knob>
      <knob label="decay"   @value="D = value" :min="0" :max="1"></knob>
      <knob label="sustain" @value="S = value" :min="0" :max="1"></knob>
      <knob label="release" @value="R = value" :min="0" :max="1"></knob>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
import { signal } from '../audio';

import { draggable } from '../mixins/draggable';
import Knob from './UI/Knob';

export default {
  mixins: [draggable],
  components: { Knob },
  props: {
    id: null,
    col: null,
    row: null
  },

  data() {
    return {
      name: 'Env',
      'A': 0.1,
      'D': 0.1,
      'S': 0.6,
      'R': 0.1,

      inlets: [
        {
          label: 'gate',
          data: this.gate
        }, {
          label: 'mod',
          data: null
        }
      ],

      outlets: [
        {
          label: 'out'
          // audio: null
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

    this.voltage = this.generateSignal();// source;


    // this._sig = this.output = new Tone.TimelineSignal();
    // this._sig.setValueAtTime(0, 0);



    // this.inlets[0].data = this.gate;
    // this.inlets[1].data = function() {};  // mod?

    this.adsr = this.context.createGain();
    this.outlets[0].audio = this.adsr;

    this.$watch('A', this.setAttack);
    this.$watch('D', this.setDecay);
    this.$watch('S', this.setSustain);
    this.$watch('R', this.setRelease);

    console.log('Creating Env');
  },

  methods: {
    gate(velocity) {
      console.log('ENV', velocity);
    },

    generateSignal() {
      // --------- taken from from Tone.js  -----------
      // const context = this.context;
      // const constant = context.createBufferSource();
      // const buffer = context.createBuffer(1, 128, context.sampleRate);
      // const arr = buffer.getChannelData(0);
      //
      // for (let i = 0; i < arr.length; i++) {
      //   arr[i] = 1;
      // }
      //
      // constant.channelCount = 1;
      // constant.channelCountMode = 'explicit';
      // constant.buffer = buffer;
      // constant.loop = true;
      // constant.start(0);

      // vs

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
    },

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

<style lang="scss">
  .env {
    background: linear-gradient(to bottom, #383633 0%, #32312e 98%, #242320 100%);
    color: #fff;

    .knob {
      fill: #fff;
    }
  }
</style>
