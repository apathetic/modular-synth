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
      <h3>Monarch</h3>
    </div>

    <div class="module-interface">
      <Toggle param="kt" @value="kt = $event" orientation="horizontal" :options="['Off', 'On']" title="Key Tracking: If on, oscillator frequency follows input pitch."></Toggle>

      <Knob param="frequency" @value="frequency = $event" variant="skirted" :min="20" :max="12000" :default="440" :precision="1" mode="log"></Knob>
      <Knob param="fm"        @value="fm = $event"        variant="skirted" :min="0"  :max="1000"  :default="0"   :precision="0"></Knob>
      <Knob param="range"     @value="range = $event"     variant="pointer" :steps="rangeSteps"></Knob>
      <Knob param="waveform"  @value="waveform = $event"  variant="pointer" :steps="waveSteps"></Knob>
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .monarch {
    background: linear-gradient(to bottom, #727067 0%, #666461 100%);
    text-transform: uppercase;

    text { /* the svg element */
      fill: #fff;
    }

    .module-interface {
      & > * { position: absolute; }
      & > :nth-child(1) { top: 12px; right: 12px; }
      & > :nth-child(2) { top: 30px; right: 12px; }
      & > :nth-child(3) { top: 50px; }
      & > :nth-child(4) { top: 160px; left: 24px; }
      & > :nth-child(5) { top: 160px; right: 24px; }
    }
  }

</style>
