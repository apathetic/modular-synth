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
      <Knob     param="PW"     @value="PW = $event"     :min="0"    :max="6.28"  :precision="2"></Knob>
      <Knob     param="detune" @value="detune = $event" :min="-500" :max="500"></Knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, inject, ref, watch, onUnmounted } from 'vue';
  import { Parameter } from '@/audio';

  export default defineComponent({
    name: 'OSC',
    // inject: [ 'context' ],
    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {
      const context: AudioContext = inject('context');
      const types: OscillatorType[] = ['sine', 'sawtooth', 'triangle', 'square']; // ==> 'pulse' instead
      const type = ref(types[0]);

      const freq = ref(440);
      const mod = ref(0);
      const PW = ref(0);
      const phase = ref(0);
      const detune = ref(0);

      // Oscillator
      const osc = context.createOscillator();
      osc.frequency.value = freq.value;
      osc.type = type.value;

      // Modulation depth
      // modDepth = new Parameter(0);
      const modDepth = context.createGain();
      modDepth.gain.value = 0;
      modDepth.connect(osc.detune);      // input connects to audioParam (freq) "mod"

      // Pulse width
      const pulse = new Parameter(0);


      const inlets = [
        {
          label: 'freq',
          desc: 'The frequency of the Oscillator. [a-rate / k-rate]',
          data: setFreq,
        },
        {
          label: 'mod',
          desc: 'Modulation input, ie. LFO or similar. Depth is controlled via the slider',
          audio: modDepth,
        },
        {
          label: 'detune',
          desc: 'Detune the oscillator frequency, similar to bend',
          data: setDetune,
        },
        {
          label: 'pulse',
          desc: 'Pulse width modulation. [0 - 1]',
          audio: pulse.input,
        }
      ];

      const outlets = [
        {
          label: 'output',
          desc: 'Audio output',
          audio: osc,
        }
      ];

      // Map k-Params
      watch(freq, setFreq);
      watch(type, setType);
      watch(PW, setPulse);
      watch(mod, setDepth);

      osc.start();

      onUnmounted(() => {
        pulse.destroy();
        osc.stop();
        // osc.disconnect(); // this is done in Connection
        modDepth.disconnect();
      });


      /**
       * k-rate control of the Oscillator frequency.
       * TODO: this should set a `base` modification frequency, around which an
       * A-rate parameter may apply modulations.
       * @param {number} f frequency
       */
      function setFreq(f: number) {
        if (f < 1) { return; } // no DC
        // osc.cancelScheduledValues();

        osc.frequency.exponentialRampToValueAtTime(f, context.currentTime + 0.01); // 10ms
        freq.value = f; // updates knob display
      }

      /**
       * Update wave type
       * @param {OscillatorType} t One of the pre-defined oscillator wave types
       */
      function setType(t: OscillatorType) {
        osc.type = t;
      }

      /**
       * Update Modulation depth. Range is from 0 to 500 cents.
       * @param {number} d Depth, between 0 and 100.
       */
      function setDepth(d: number) {
        const currentFreq = osc.frequency.value;
        const cents = d * 5; // 0 -> 500 cents
        // const freq = currentFreq * Math.pow(2, cents / 1200);
        // const depth = currentFreq * d / 100.0;

        modDepth.gain.value = d; // freq - currentFreq;
      }

      /**
       * Update Oscillator detune
       * @param {number} d Detune, between 0 and 1.
       */
      function setDetune(d: number) {
        const currentFreq = osc.frequency.value;
        const freq = currentFreq * Math.pow(2, d);
      }

      /**
       * Update Oscillator Pulse width
       * @param {float} p  Pulse, between 0 and 1.
       */
      function setPulse(p: number) {
        pulse.input = PW.value = p;
      }

      /**
       * The phase of the oscillator in degrees.
       * @type {Degrees}
       * @name phase
       * @example
       * osc.phase = 180; //flips the phase of the oscillator
       */
      function getPhase() {
        return phase.value * (180 / Math.PI);
      }

      /**
       *
       */
      function setPhase(phase) {
        phase.value = phase.value * Math.PI / 180;
        // reset the type
        // type.value = ....
      }


      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        inlets,
        outlets,
        type,
        types,
        mod,
        freq,
        PW,
        detune,
      };
    }
  });
</script>


<style lang="scss">
  .oscillator {
    background: linear-gradient(to bottom, #f2efed 0%, #d9d7d5 98%, #959492 100%);
    color: #000;

    p {
      position: absolute;
      font-size: 4.5em;
      font-weight: lighter;
      font-family: var(--font-secondary);
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
