<template>
  <div class="env">
    <div class="module-details">
      <h3>Env</h3>
    </div>

    <div class="module-interface">
      <knob param="attack"  @value="A = $event" :min="0.01" :max="1" :default="0.1" :decimals="2"></knob>
      <knob param="decay"   @value="D = $event" :min="0.01" :max="1" :default="0.2" :decimals="2"></knob>
      <knob param="sustain" @value="S = $event" :min="0.01" :max="1" :default="0.8" :decimals="2"></knob>
      <knob param="release" @value="R = $event" :min="0.01" :max="1" :default="0.3" :decimals="2"></knob>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
  import { signal } from '../audio';
  import Knob from './UI/Knob';

  export default {
    components: { Knob },
    props: {
      id: null
    },

    data() {
      return {
        name: 'Env',

        A: 0.1,
        D: 0.1,
        S: 0.6,
        R: 0.1,

        inlets: [
          { label: 'vel',
            desc: 'Acts as a trigger for the envelope' },
          { label: 'mod',
            desc: '???' }
        ],

        outlets: [
          { label: 'out' }
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
    },

    destroyed() {
      signal(1).disconnect(this.adsr);
      this.adsr.disconnect(); // this is done in Connection

      // DESTROY signal? TODO
    },

    methods: {
      gate(velocity) {
        if (velocity) {
          this.start();
        } else {
          this.stop();
        }
      },

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
