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
      <knob param="attack"  @value="A = $event" :min="0.01" :max="1" :decimals="2"></knob>
      <knob param="decay"   @value="D = $event" :min="0.01" :max="1" :decimals="2"></knob>
      <knob param="sustain" @value="S = $event" :min="0.01" :max="1" :decimals="2"></knob>
      <knob param="release" @value="R = $event" :min="0.01" :max="1" :decimals="2"></knob>
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
          data: 999
        }, {
          label: 'mod-A',
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
    this.adsr = this.context.createGain();
    this.adsr.gain.value = 0;

    this.inlets[0].data = this.gate;      // input is mapped to gate fn
    // this.inlets[1].data = function() {};  // mod?

    this.outlets[0].audio = this.adsr;
    signal(1).connect(this.adsr);

    // this.$watch('A', this.setAttack);
    // this.$watch('D', this.setDecay);
    // this.$watch('S', this.setSustain);
    // this.$watch('R', this.setRelease);

    console.log('Creating Env');
  },

  destroyed() {
    signal(1).disconnect();   // or is it:
    // this.adsr.disconnect();  // ...?

    // DESTROY signal. TODO
  },

  methods: {
    gate(velocity) {
      if (velocity) {
        this.start();
      } else {
        this.stop();
      }
    },

    // start(when) {
    //   var attackRampMethodName = this._getRampMethodName('attack');
    //   var decayRampMethodName = this._getRampMethodName('decay');
    //
    //   var attackStartsAt = when + this.settings.delayTime;
    //   var attackEndsAt = attackStartsAt + this.settings.attackTime;
    //   var decayStartsAt = attackEndsAt + this.settings.holdTime;
    //   var decayEndsAt = decayStartsAt + this.settings.decayTime;
    //   var attackStartLevel = (attackRampMethodName === 'exponentialRampToValueAtTime') ? 0.001 : 0;
    //
    //   this.adsr.gain.setValueAtTime(attackStartLevel, when);
    //   this.adsr.gain.setValueAtTime(attackStartLevel, attackStartsAt);
    //   this.adsr.gain[attackRampMethodName](1, attackEndsAt);
    //   this.adsr.gain.setValueAtTime(1, decayStartsAt);
    //   this.adsr.gain[decayRampMethodName](this.settings.sustainLevel, decayEndsAt);
    // },

    start() {   // "trigger" ?
      const now = this.context.currentTime;
      const adsr = this.adsr.gain;
      const currentValue = adsr.value;  // for the case where the previous envelope is still active

      adsr.cancelScheduledValues(now);
      adsr.setValueAtTime(currentValue, now);


      // perhaps better:

      // setTargetAtTime(to, now, duration)
      // exponentialRampToValueAtTime
      adsr.linearRampToValueAtTime(1, now + this.A);
      adsr.linearRampToValueAtTime(this.S, now + this.A + this.D);
    },

    stop() {    // "release"
      const now = this.context.currentTime;
      const adsr = this.adsr.gain;

      adsr.cancelScheduledValues(0);
      adsr.setValueAtTime(adsr.value, now);
      adsr.linearRampToValueAtTime(0, now + this.R);
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
