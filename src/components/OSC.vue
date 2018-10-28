<template>
  <div class="oscillator">
    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <input @mousedown.stop type="checkbox" v-for="type in types" :value="type">{{ type }}</input>

      <slider param="mod"  @value="mod = $event"  :min="0" :max="100"></slider>
      <p>OSC</p>
      <knob   param="freq" @value="freq = $event" :min="1" :max="2000"></knob>
      <knob   param="PW"   @value="PW = $event"   :min="0" :max="6.28"></knob>
    </div>

    <div class="module-connections">
      <inlets  :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
  import { Oscillator, PWM } from '../audio';
  import Knob from './UI/Knob';
  import Slider from './UI/Slider';

  export default {
    components: { Knob, Slider },
    props: {
      id: null
    },

    data() {
      return {
        name: 'Oscillator B',

        freq: 440,
        mod: 0,
        PW: 0,
        type: 'sine',
        types: ['sine', 'sawtooth', 'triangle', 'pulse'],

        inlets: [
          { label: 'freq' },
          { label: 'FM' },
          { label: 'PWM' }
        ],

        outlets: [
          { label: 'output' }
        ]
      };
    },

    created() {
      this.osc = new Oscillator(this.freq, this.type);
      this.pwm = new PWM();

      // this.gain = this.context.createGain();
      // this.gain.value = 0;
      // this.gain.connect(this.osc.frequency);      // input connects to audioParam (freq) "mod"

      this.osc.start();

      this.inlets[0].data = this.setFreq;
      this.outlets[0].audio = this.osc;

      // k-Param for controlling mod, sync
      this.$watch('freq', this.setFreq);
      this.$watch('mod', this.setMod);
      this.$watch('type', this.setType);
    },

    destroyed() {
      this.osc.destroy();
    },

    methods: {
      /**
       * k-rate control of the Oscillator frequency
       * @param  {Float} f frequency
       */
      setFreq(f) {
        // this.node.frequency.value = f;
        this.osc.frequency.value = f;
        // this.osc.frequency.setValueAtTime(f, context.currentTime);
      },

      /**
       * Update wave type
       * @param  {String} t One of the pre-defined oscillator wave types
       */
      setType(t) {
        this.osc.type = t;
      },

      /**
       * Update Oscillator gain
       * @param  {Float} g  Gain, between 0 and 1.
       */
      setMod(g) {
        this.gain.value = g;
      },

      /**
       * The phase of the oscillator in degrees.
       * @type {Degrees}
       * @name phase
       * @example
       * osc.phase = 180; //flips the phase of the oscillator
       */
      getPhase() {
        return this._phase * (180 / Math.PI);
      },

      setPhase(phase) {
        this._phase = phase * Math.PI / 180;
        // reset the type
        this.type = this._type;
      }
    }
  };
</script>

<style lang="scss">
  @import '../styles/variables.scss';

  .oscillator {
    background: linear-gradient(to bottom, #f2efed 0%,#d9d7d5 98%,#959492 100%);
    color: #000;

    select {
      position: absolute;
      top: 14em;
      left: 11em;
    }

    p {
      position: absolute;
      font-size: 4.5em;
      font-weight: lighter;
      font-family: $font-secondary;
      color: #bbb;
      top: 1.5em;
      left: 2em;
    }

    text {
      color: #000;
    }

    .knob {
      float: left;
      clear: left;
    }

    .slider {
      position: absolute;
      left: 9em;
    }
  }
</style>
