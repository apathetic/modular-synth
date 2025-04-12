<template>
  <div class="filter">
    <div class="module-details">
      <h3>Filter</h3>
    </div>

    <div class="module-interface">
      <Knob param="freq" @value="freq = $event" :min="100" :max="12000" mode="log"></Knob>
      <Knob param="Q"    @value="Q = $event"    :min="0"   :max="1" :precision="2"></Knob>
      <Dropdown param="type" @value="type = $event" :options="types"></Dropdown>

      <canvas ref="canvas"></canvas>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted } from 'vue';
  import { filter, parameter } from '@/audio';

  export default defineComponent({
    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {
      const types = ['allpass', 'bandpass', 'highpass', 'lowpass', 'peaking'] as const;
      const type = ref<BiquadFilterType>(types[0]);
      const freq = ref(440);
      const Q = ref(1);

      // Create the filter and its modulation
      const filterNode = filter(type.value, freq.value, Q.value);
      const mod = parameter(500); // range: 0 - 500 cents (interval of a 5th)
      mod.output.connect(filterNode.detune);

      const inlets = [
        {
          label: 'input',
          desc: 'signal to filter',
          audio: filterNode
        },
        {
          label: 'freq',
          desc: 'filter frequency',
          data: (f: number) => filterNode.frequency.value = f
        },
        {
          label: 'mod',
          audio: mod.input
        }
      ];

      const outlets = [
        {
          label: 'output',
          desc: 'Audio output',
          audio: filterNode
        }
      ];

      watch(freq, (f) => filterNode.frequency.value = f);
      watch(Q, (q) => filterNode.Q.value = q);
      watch(type, (t) => filterNode.type = t as BiquadFilterType);

      onUnmounted(() => {
        mod.destroy();
      });

      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        inlets,
        outlets,
        freq,
        Q,
        type,
        types
      }
    }
  });
</script>


<style lang="scss">
  $grey: #a8a8a8;
  // $teal: #409d9e;
  $teal: #2c6c6d;

  .filter {
    background-image: radial-gradient(
      circle,
      $grey 0%,
      $grey  10%,
      $teal 10%,
      $teal 26%,
      $grey  26%,
      $grey  28%,
      $teal 28%,
      $teal 36%,
      $grey  36%,
      $grey  40%,
      $teal 40%,
      $teal 44%,
      $grey  44%,
      $grey  52%,
      $teal 52%,
      $teal 54%,
      $grey  54%,
      $grey  100%
    );
    background-position: 100% 66%;
    background-size: 150%;
    color: #fff;

    text {
      fill: #fff;
    }

    select {
      position: absolute;
      bottom: 22px;
      left: 33%;
    }

    .knob:first-child {
      transform: scale(1.5);
      top: 43px;
      left: -4px;
    }
  }
</style>
