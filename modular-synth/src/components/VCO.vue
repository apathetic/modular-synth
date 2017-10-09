<template>
  <div
    class="oscillator module _4U"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <select class="select" @mousedown.stop v-model="type">
        <option v-for="type in types" :value="type">{{ type }}</option>
      </select>
      <slider param="mod"    @value="mod = $event"  :min="0" :max="100"></slider>
      <p>OSC</p>
      <knob
        param="freq"
        mode="log"
        :min="100"
        :max="12000"
        @value="freq = $event">
      </knob>
      <knob   param="PW"     @value="PW = $event"     :min="0"    :max="6.28"></knob>
      <knob   param="detune" @value="detune = $event" :min="-500" :max="500"></knob>
    </div>

    <div class="module-connections">
      <inlets  :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
  import { Parameter } from '../audio';
  import { draggable } from '../mixins/draggable';
  import Knob from './UI/Knob';
  import Slider from './UI/Slider2';

  export default {
    mixins: [draggable],
    components: { Knob, Slider },
    props: {
      id: null,
      col: null,
      row: null
    },

    data() {
      return {
        name: 'Oscillator',

        freq: 440,
        mod: 0,
        PW: 0,
        phase: 0,
        detune: 0,
        type: 'sine',
        types: ['sine', 'sawtooth', 'triangle'], // 'square', ==> 'pulse' instead

        inlets: [
          { label: 'freq',
            desc: 'The frequency of the Oscillator. [A-rate / k-rate]'
          },
          { label: 'mod',
            desc: 'Modulation input, ie. LFO or similar. Depth is controlled via the slider'
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
      this.mod_ = this.context.createGain();
      this.mod_.value = 0;

      // Pulse width
      this.pulse_ = new Parameter(0);

      // Inlets
      this.inlets[0].data = this.setFreq;             // NOTE: if the input is a k-rate conrol, we connect it here...
      // this.inlets[0].audio = this.osc.frequency;   //       ...else, if the input is a signal, we connect this one
      this.inlets[1].audio = this.mod_.gain;          // NOTE: this is how we control the depth of the modulation (ie. in the _receiving_ module rather than the source)
      this.inlets[2].audio = this.pulse_.input;

      // Outlets
      this.outlets[0].audio = this.osc_;

      // Connectify
      this.mod_.connect(this.osc_.frequency);      // input connects to audioParam (freq) "mod"
      // this.frequency.connect(this.osc_.frequency);

      // Map k-Params
      // this.$watch('freq', this.setFreq);
      this.$watch('type', this.setType);
      this.$watch('PW', this.setPulse);
      this.$watch('mod', this.setDepth);

      console.log('Creating VCO');
      this.osc_.start();
    },

    destroyed() {
      console.log('Destroying VCO ', this.id);
    },

    methods: {
      /**
       * k-rate control of the Oscillator frequency.
       * TODO: this should set a `base` modification frequency, around which an
       * A-rate parameter may apply modulations.
       * @param  {Float} f frequency
       */
      setFreq(f) {
        console.log(f);
        this.osc_.frequency.value = f;
        // this.osc_.frequency.setValueAtTime(f, context.currentTime);
        // update knob display
        this.freq = f;
      },

      /**
       * Update wave type
       * @param  {String} t One of the pre-defined oscillator wave types
       */
      setType(t) {
        this.osc_.type = t;
      },

      /**
       * Update Oscillator gain
       * @param  {Float} g  Gain, between 0 and 1.
       */
      setDepth(d) {
        this.mod_.value = this.osc_.frequency.value * d / 100.0;
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

      setPhase(phase) {
        this._phase = phase * Math.PI / 180;
        // reset the type
        this.type = this._type;
      }
    }
  };
</script>

<style lang="scss">
  @import '../assets/scss/variables.scss';

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
      top: 2em;
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
