<template>
  <div class="lfo">
    <div class="module-details">
      <h3>LFO</h3>
    </div>

    <div class="module-interface">
      <slider
        param="mod"
        :min="0"
        :max="50"
        @value="mod = $event">
      </slider>

      <knob
        param="freq"
        mode="log"
        :min="min"
        :max="max"
        :decimals="1"
        @value="freq = $event">
      </knob>

      <!-- swing is a DC offset -->
      <knob
        param="swing"
        @value="swing = $event">
      </knob>

      <dropdown
        param="type"
        :options="types"
        @value="type = $event">
      </dropdown>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
  import Dropdown from './UI/Dropdown';
  import Knob from './UI/Knob';
  import Slider from './UI/Slider';

  export default {
    components: { Dropdown, Knob, Slider },
    props: {
      id: null
    },

    data() {
      return {
        name: 'LFO',
        freq: 2.0,
        mod: 0,
        min: 0.1,
        max: 50,
        phase: 0,
        type: 'sine',
        types: ['sine', 'square', 'sawtooth', 'triangle'],

        inlets: [
          {
            label: 'reset',
            desc: ''
          },
          {
            label: 'mod',
            desc: 'The amount of frequency modulation'
          }
        ],

        outlets: [
          {
            label: 'output',
            desc: 'Audio output'
          }
        ]
      };
    },

    created() {
      // LFO
      this.lfo = this.context.createOscillator();
      this.lfo.type = this.type;
      this.lfo.frequency.value = this.freq;

      // Modulation depth
      this.modDepth_ = this.context.createGain();
      this.modDepth_.value = 0;
      this.modDepth_.connect(this.lfo.detune);

      // Inlets
      this.inlets[0].data = this.reset; // input is 'data'. mapped to a fn
      this.inlets[1].audio = this.modDepth_;

      // Outlets
      this.outlets[0].audio = this.lfo;

      // Map k-Params
      this.$watch('freq', this.setFreq);
      this.$watch('mod', this.setDepth);
      this.$watch('type', this.setType);

      this.lfo.start();
    },

    methods: {
      reset() {

      },

      /**
       * k-rate control of the Oscillator frequency.
       * @param {Float} f frequency
       */
      setFreq(f) {
        this.lfo.frequency.value = f;
      },

      /**
       * Update the (frequency) modulation depth.
       * @param {Float} d Depth, betwen 0 and 100.
       */
      setDepth(d) {
        this.modDepth_.gain.value = d;
      },

      /**
       * Update wave type
       * @param {String} t One of the pre-defined oscillator wave types
       */
      setType(t) {
        this.lfo.type = t;
      }
    }
  };
</script>

<style lang="scss">
  .lfo {
    background: linear-gradient(to bottom, #f2efed 0%,#d9d7d5 98%,#959492 100%);
    color: #000;

    .slider {
      position: absolute;
      left: 9em;
    }
  }
</style>
