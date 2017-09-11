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
      <slider param="mod"  @value="mod = $event"  :min="0" :max="100"></slider>
      <p>OSC</p>
      <knob
        param="freq"
        mode="log"
        :min="1"
        :max="2000"
        @value="freq = $event">
      </knob>
      <knob   param="PW"   @value="PW = $event"   :min="0" :max="6.28"></knob>
    </div>

    <div class="module-connections">
      <inlets  :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
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
        type: 'sine',
        types: ['sine', 'sawtooth', 'triangle'], // 'square', ==> 'pulse' instead

        inlets: [
          {
            label: 'freq'
            // data: null       // this accepts a K-rate param
            // audio: null,     // this accepts an A-rate param
          },
          {
            label: 'mod'        // need this, so that we can modify mod _depth_ with the slider
          },
          {
            label: 'pulse'
          }
        ],

        outlets: [
          {
            label: 'output'
          }
        ]
      };
    },

    created() {
      this.gain = this.context.createGain();
      this.osc = this.context.createOscillator();

      this.inlets[0].data = this.setFreq;     // NOTE: if the input is a k-rate conrol, we connect it here
      this.inlets[0].audio = this.gain;       //       ...else, if the input is a signal, we connect this one
      this.inlets[1].audio = this.gain;       // NOTE: this is how we control the depth of the modulation (ie. in the _receiving_ module rather than the source)

      this.outlets[0].audio = this.osc = this.context.createOscillator();

      this.gain.value = 0;
      this.gain.connect(this.osc.frequency);      // input connects to audioParam (freq) "mod"

      this.osc.type = this.type;
      this.osc.frequency.value = this.freq;
      this.osc.start();

      // k-Param for controlling mod, sync
      this.$watch('freq', this.setFreq);
      this.$watch('type', this.setType);
      this.$watch('mod', this.setMod);

      console.log('Creating VCO');
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
