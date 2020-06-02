<template>
  <div class="comb">
    <div class="module-details">
      <h3>Comb</h3>
    </div>

    <div class="module-interface">
      <knob param="resonance" @value="resonance = $event" :min="0" :max="100"></knob>
      <knob param="cutoff"    @value="cutoff = $event"    :min="40" :max="16000" scale="log"></knob>
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets"></Inlets>
      <Outlets :ports="outlets"></Outlets>
    </div>
  </div>
</template>

<script>
  // import Knob from '@/components/UI/Knob';

  export default {
    // components: { Knob },
    props: {
      id: null
    },

    data() {
      return {
        name: 'Comb',

        freq: 440,
        types: ['lowpass', 'hipass', 'bandpass', 'notch'],
        Q: 1,

        inlets: [
          {
            label: 'input'
            // audio: null
          }, {
            label: 'input'
            // audio: null
          }
        ],

        outlets: [
          {
            label: 'output-1'
            // audio: null
          }, {
            label: 'output-2'
            // audio: null
          }
        ]
      };
    },

    created() {
      this.filter = this.context.createBiquadFilter();
      this.filter.type = this.types[0];
      this.filter.frequency.value = this.freq;
      this.filter.Q.value = this.Q;

      // connect input to our filter
      this.inlets[0].audio = this.filter;
      this.outlets[0].audio = this.filter;

      // this.$watch('type', this.setReverb);
      // this.$watch('freq', this.setDecay);
      // this.$watch('Q', this.setDecay);
    },

    // destroyed() {
    //   this.filter.disconnect();// this is done in Connection
    // },

    methods: {
      setFreq(f) {
        this.filter.frequency.value = f;
      },

      setType(t) {
        this.filter.type = this.types[t] || 'lowpass';
      }
    }
  };
</script>

<style lang="scss">
  $grey: #a8a8a8;
  $purple: #c35896;
  .comb {
    background:
      linear-gradient(187deg,                  $purple 0%,  $purple 22%, transparent 22%) no-repeat,
      linear-gradient(192deg, transparent 22%, $purple 22%, $purple 26%, transparent 26%) no-repeat,
      linear-gradient(196deg, transparent 22%, $purple 22%, $purple 25%, transparent 25%) no-repeat,
      linear-gradient(199deg, transparent 22%, $purple 22%, $purple 24%, transparent 24%) no-repeat,
      linear-gradient(201deg, $grey 22%,       $purple 22%, $purple 23%, $grey 23%);

    background-position: 0 0, 0 5px, 100% 16px, 100% 38px, 100% 50px;
    background-size: 100%, 110%, 120%, 120%, 130%;



    color: #fff;

    text {
      color: #fff;
    }
  }
</style>
