<template>
  <div class="oscillator">
    <div class="module-details">
      <h3>Oscillator</h3>
    </div>

    <div class="module-interface">
      <p>OSC</p>
      <Dropdown param="type"   @value="type = $event" :options="types"></Dropdown>
      <Slider   param="mod"    @value="mod = $event"    :min="0"    :max="100"></Slider>
      <Knob     param="freq"   @value="freq = $event"   :min="100"  :max="12000" :default="440" mode="log"></Knob>
      <Knob     param="PW"     @value="PW = $event"     :min="0"    :max="6.28"></Knob>
      <Knob     param="detune" @value="detune = $event" :min="-500" :max="500"></Knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"></Inlets>
      <Outlets :ports="outlets"></Outlets>
    </div>
  </div>
</template>

<script>
  // NOW REGISTERED GLOBALLLYYYY???
  // import Knob from './UI/Knob';
  // import Slider from './UI/Slider';
  // import Dropdown from './UI/Dropdown';
  import { Parameter } from '@/audio';

  export default {
    name: 'OSC',

    // components: {
    //   Knob,
    //   Slider,
    //   Dropdown
    // },
    props: {
      /**
       * Used as a reference by `Connection` to connect modules
       */
      id: {
        default: undefined,
        required: true
      }
    },

    data() {
      return {
        // name: 'OSC',
        freq: 440,
        mod: 0,
        PW: 0,
        phase: 0,
        detune: 0,
        type: 'sine',
        types: ['sine', 'sawtooth', 'triangle', 'square'], // ==> 'pulse' instead

        inlets: [
          { label: 'freq',
            desc: 'The frequency of the Oscillator. [a-rate / k-rate]'
          },
          { label: 'mod',
            desc: 'Modulation input, ie. LFO or similar. Depth is controlled via the slider'
          },
          { label: 'detune',
            desc: 'Detune the oscillator frequency, similar to bend'
          },
          { label: 'pulse',
            desc: 'Pulse width modulation. [0 - 1]'
          }
        ],

        outlets: [
          { label: 'output',
            desc: 'Audio output' }
        ]
      };
    },

    created() {
      // Oscillator
      this.osc_ = this.context.createOscillator();
      this.osc_.frequency.value = this.freq;
      this.osc_.type = this.type;

      // Modulation depth
      // this.modDepth_ = new Parameter(0);
      this.modDepth_ = this.context.createGain();
      this.modDepth_.gain.value = 0;
      this.modDepth_.connect(this.osc_.detune);      // input connects to audioParam (freq) "mod"

      // Pulse width
      this.pulse_ = new Parameter(0);

      // Inlets
      this.inlets[0].data = this.setFreq;             // NOTE: if the input is a k-rate control, we connect it here...
      this.inlets[1].audio = this.modDepth_;
      this.inlets[2].data = this.setDetune;
      this.inlets[3].audio = this.pulse_.input;

      // Outlets
      this.outlets[0].audio = this.osc_;

      // Map k-Params
      this.$watch('freq', this.setFreq);
      this.$watch('type', this.setType);
      this.$watch('PW', this.setPulse);
      this.$watch('mod', this.setDepth);

      this.osc_.start();
    },


    destroyed() {
      this.pulse_.destroy();
      this.osc_.stop();
      this.osc_.disconnect(); // this is done in Connection
      this.modDepth_.disconnect();
    },


    methods: {
      /**
       * k-rate control of the Oscillator frequency.
       * TODO: this should set a `base` modification frequency, around which an
       * A-rate parameter may apply modulations.
       * @param  {Float} f frequency
       */
      setFreq(f) {
        if (f < 1) { return; } // no DC
        // this.osc_.cancelScheduledValues();

        this.osc_.frequency.exponentialRampToValueAtTime(f, this.context.currentTime + 0.01); // 10ms
        this.freq = f; // updates knob display
      },

      /**
       * Update wave type
       * @param  {String} t One of the pre-defined oscillator wave types
       */
      setType(t) {
        this.osc_.type = t;
      },

      /**
       * Update Modulation depth. Range is from 0 to 500 cents.
       * @param {Float} d Depth, between 0 and 100.
       */
      setDepth(d) {
        const currentFreq = this.osc_.frequency.value;
        const cents = d * 5; // 0 -> 500 cents
        const freq = currentFreq * Math.pow(2, cents / 1200);
        // const depth = currentFreq * d / 100.0;

        this.modDepth_.gain.value = d; // freq - currentFreq;
      },

      /**
       * Update Oscillator detune
       * @param  {Float} d Detune, between 0 and 1.
       */
      setDetune(d) {
        console.log(d);
        const currentFreq = this.osc_.frequency.value;
        const freq = currentFreq * Math.pow(2, d);

      },

      /**
       * Update Oscillator Pulse width
       * @param  {Float} p  Pulse, between 0 and 1.
       */
      setPulse(p) {
        this.pulse_.input = this.PW = p;
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

      /**
       *
       */
      setPhase(phase) {
        this._phase = phase * Math.PI / 180;
        // reset the type
        this.type = this._type;
      }
    }
  };
</script>

<style lang="scss">
  .oscillator {
    background: linear-gradient(to bottom, #f2efed 0%, #d9d7d5 98%, #959492 100%);
    color: #000;

    p {
      position: absolute;
      font-size: 4.5em;
      font-weight: lighter;
      font-family: $font-secondary;
      color: #bbb;
      top: 2em;
      left: 2em;
      z-index: -1;
      //   font-size: 13.5em;
      //   color: #d4d4d4;
      //   top: 0.4em;
      //   left: -0.3em;
      //   z-index: -1;
      //   letter-spacing: -.09em;
      //   text-shadow: 1px 1px rgba(255,255,255, 0.2);
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

    .dropdown {
      position: absolute;
      top: 14em;
      left: 11em;
    }
  }
</style>
