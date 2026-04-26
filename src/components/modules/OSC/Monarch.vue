<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted } from 'vue';
  import { Monarch } from '~/audio/oscillators/composed/monarch';

  export default defineComponent({
    name: 'Monarch',
    props: {
      id: {
        default: undefined,
        required: true
      }
    },
    setup(props, { expose }) {
      const rangeSteps = ["32'", "16'", "8'", "4'", "2'", "LO"];
      const waveSteps = ["Tri", "RSaw", "Saw", "Sqr", "Wide", "Narr"];

      const range = ref(2); // 8'
      const waveform = ref(0);
      const frequency = ref(440);
      const kt = ref(1); // On
      const fm = ref(0);

      const osc = new Monarch();

      const inlets = osc.inlets;
      const outlets = osc.outlets;

      watch(range, (val) => osc.range = val);
      watch(waveform, (val) => osc.waveform = val);

      watch(frequency, (val) => osc.setFrequency(val));

      watch(kt, (val) => osc.kt = val);
      watch(fm, (val) => osc.fm.value = val);

      osc.start();

      onUnmounted(() => {
        osc.stop();
        osc.destroy();
      });

      expose({
        inlets,
        outlets
      });

      return {
        inlets,
        outlets,
        rangeSteps,
        waveSteps,
        range,
        waveform,
        frequency,
        kt,
        fm
      };
    }
  });
</script>

<template>
  <div class="oscillator monarch">
    <div class="module-details">
      <h3>Monarch OSC 1</h3>
    </div>

    <div class="module-interface">
        <Knob param="range" @value="range = $event" :steps="rangeSteps" :min="0" :max="5" :precision="0"></Knob>
        <Knob param="waveform" @value="waveform = $event" :steps="waveSteps" :min="0" :max="5" :precision="0"></Knob>
        <Knob param="frequency" @value="frequency = $event" :min="20" :max="12000" :default="440" mode="log" :precision="1"></Knob>

      <div class="toggle-row">
        <Toggle param="kt" @value="kt = $event" :options="['Off', 'On']" title="Key Tracking: If on, oscillator frequency follows input pitch."></Toggle>
        <Knob param="fm" @value="fm = $event" :min="0" :max="1000" :default="0" :precision="0"></Knob>
      </div>
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .monarch {
    background: linear-gradient(to bottom, #2b2e31 0%, #1e2022 100%);
    color: #fff;
    border: 1px solid #444;
    border-radius: 4px;
  }

  .monarch h3 {
    color: #ccc;
    font-family: var(--font-primary, sans-serif);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: 1rem;
    margin: 0;
    padding: 12px;
    border-bottom: 1px solid #333;
  }
/*
  .module-interface {
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .knob-row, .toggle-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
  } */
</style>
