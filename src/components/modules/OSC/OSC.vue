<template>
  <div class="oscillator">
    <div class="module-details">
      <h3>Oscillator</h3>
    </div>

    <div class="module-interface">
      <p>OSC</p>
      <Dropdown param="type"   @value="setType"       :options="types"></Dropdown>
      <Slider   param="mod"    @value="setDepth"      :min="0"    :max="100"></Slider>
      <Knob     param="freq"   @value="setFrequency"  :min="100"  :max="12000" :default="440" mode="log"></Knob>
      <Knob     param="PW"     @value="setPulseWidth" :min="0"    :max="6.28"  :precision="2"></Knob>
      <Knob     param="detune" @value="setDetune"     :min="-500" :max="500"></Knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, ref, onUnmounted } from 'vue';
  import { Parameter, oscillator, gain } from '@/audio';

  export default defineComponent({
    name: 'OSC',

    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {
      const types: OscillatorType[] = ['sine', 'sawtooth', 'triangle', 'square'];
      const type = ref(types[0]);
      // const osc = new AMOscillator(440, type.value);
      // const osc = new Oscillator(440, type.value);

      const freq = ref(440);
      const mod = ref(0);
      const PW = ref(0);
      const phase = ref(0);
      const detune = ref(0);

      // Oscillator
      const osc = oscillator(freq.value, type.value);

      // Modulation depth
      // modDepth = new Parameter(0);
      const modDepth = gain(0);
      modDepth.connect(osc.detune);      // input connects to audioParam (freq) "mod"

      // Pulse width
      // const pulse = new Parameter(0);


      const inlets = [
        {
          label: 'freq',
          desc: 'The frequency of the Oscillator. [a-rate / k-rate]',
          data: setFrequency,
        },
        // {
        //   label: 'mod',
        //   desc: 'Modulation input, ie. LFO or similar. Depth is controlled via the slider',
        //   audio: modDepth,
        // },
        {
          label: 'detune',
          desc: 'Detune the oscillator frequency, similar to bend',
          data: setDetune,
        },
        // {
        //   label: 'pulse',
        //   desc: 'Pulse width modulation. [0 - 1]',
        //   audio: pulse.input,
        // }
      ];

      const outlets = [
        {
          label: 'output',
          desc: 'Audio output',
          audio: osc,
        }
      ];


      onUnmounted(() => { osc.dispose(); });


      /**
       * k-rate control of the Oscillator frequency.
       * @param {number} f frequency
       */
      function setFrequency(f: number) {
        if (f < 1) { return; } // no DC
        // osc.cancelScheduledValues();

        // osc.frequency.exponentialRampToValueAtTime(f, context.currentTime + 0.01); // 10ms
        // freq.value = f; // updates knob display
        osc.set({ frequency: f });
      }

      /**
       * Update wave type
       * @param {OscillatorType} t One of the pre-defined oscillator wave types
       */
      function setType(t: OscillatorType) {
        osc.set({ type: t });
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

        osc.set({ harmonicity: d });
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
      function setPulseWidth(p: number) {
        // Update the property that contains the value (not connecting audio nodes here)
        pulse.set(p);
        PW.value = p;
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
        types,
        setType,
        setFrequency,
        setPulseWidth,
        setDepth,
        setDetune,
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
