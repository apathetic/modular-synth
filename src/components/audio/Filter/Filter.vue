<template>
  <div class="filter">
    <div class="module-details">
      <h3>Filter</h3>
    </div>

    <div class="module-interface">
      <Knob param="freq" @value="freq = $event" :min="100" :max="12000" mode="log"></Knob>
      <Knob param="Q"    @value="Q = $event"    :min="0"   :max="1" :precision="2"></Knob>
      <select class="select" @mousedown.stop v-model="type">
        <option v-for="type in types" :value="type">{{ type }}</option>
      </select>

      // <Dropdown param="type"   @value="type = $event"     :options="types"></Dropdown>

    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>

<script>
  import { defineComponent, inject, ref, watch, onMounted, onUnmounted } from 'vue';
  // import { useAppStore } from '@/stores/app';
  import { Parameter } from '@/audio';

  export default defineComponent({
    props: {
      id: null
    },

    setup (props, { expose }) {
      const context = inject('context');
      const types = ['allpass', 'bandpass', 'highpass', 'lowpass', 'peaking'];
      const type = ref(types[0]);
      const freq = ref(440);
      const Q = ref(1);

      const filter = context.createBiquadFilter();
      filter.type = type.value;
      filter.frequency.value = freq.value;
      filter.Q.value = Q.value;

      const mod = new Parameter(500); // range: 0 - 500 cents (interval of a 5th)
      mod.output.connect(filter.detune);    // filter tremolo

      const inlets = [
        {
          label: 'input',
          desc: 'signal to filter',
          audio: filter
        },
        {
          label: 'freq',
          desc: 'filter frequency',
          data: (f) => filter.frequency.value = f
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
          audio: filter
        }
      ];

      watch(freq, (f) => filter.frequency.value = f);
      watch(Q, (q) => filter.Q.value = q);
      // $watch('type', (t) => filter.type = t || 'lowpass');


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
