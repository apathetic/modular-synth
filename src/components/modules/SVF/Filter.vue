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
  import { defineComponent, inject, ref, watch, onMounted, onUnmounted } from 'vue';
  import { Parameter } from '@/audio';


  const FILTERS = {
    "lowpass": { q:true, gain: false },
    "highpass": { q:true, gain: false },
    "bandpass": { q:true, gain: false },
    "lowshelf": { q:false, gain: true },
    "highshelf": { q:false, gain: true },
    "peaking": { q:true, gain: true },
    "notch": { q:true, gain: false },
    "allpass": { q:true, gain: false }
  };



  export default defineComponent({
    props: {
      id: null
    },

    setup (props, { expose }) {
      const context = inject('context');
      const canvas = ref();
      const types = ['allpass', 'bandpass', 'highpass', 'lowpass', 'peaking'];
      const type = ref(types[0]);
      const freq = ref(440);
      const Q = ref(10);

      const filter = context.createBiquadFilter();
      filter.type = type.value;
      filter.frequency.value = freq.value;
      filter.Q.value = Q.value;
      filter.gain.value = 20;

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
          data: (f) => freq.value = f  // filter.frequency.value = f
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

      watch(freq, (f) => filter.frequency.value = f); // updateFrequencyResponse();
      watch(Q, (q) => filter.Q.value = q); // updateFrequencyResponse();
      watch(type, (t) => filter.type = t || 'lowpass');

      let visualizer;
      let canvasWidth = 0;
      let canvasHeight = 0;


      onUnmounted(() => {
        frequencies = null;
        phases = null;
        magnitudes = null;
      });

      onMounted(() => {
        visualizer = canvas.value.getContext('2d');
        canvasWidth = visualizer.canvas.width;
        canvasHeight = visualizer.canvas.height;
        watch([freq, Q, type], updateFrequencyResponse);
        updateFrequencyResponse();
      });


      let frequencyBars = 100;

      var frequencies = new Float32Array(frequencyBars);
      var magnitudes = new Float32Array(frequencyBars); // will hold analysis
      var phases = new Float32Array(frequencyBars); // will hold analysis

      for(var i = 0; i < frequencyBars; ++i) {
        frequencies[i] = 2000/frequencyBars*(i+1);
      }

      function updateFrequencyResponse() {
        filter.getFrequencyResponse(frequencies, magnitudes, phases);
        drawFrequencyResponse(magnitudes, phases);
      }

      function drawFrequencyResponse(mag, phase) {
        const barWidth = canvasWidth / frequencyBars;
        visualizer.clearRect(0, 0, canvasWidth, canvasHeight);

        // Magnitude
        visualizer.strokeStyle = 'black';
        visualizer.beginPath();
        for(let i = 0; i < frequencyBars; ++i) {
          visualizer.lineTo(i * barWidth, canvasHeight - mag[i]*90);
        }
        visualizer.stroke();

        // Phase
        visualizer.strokeStyle = "red";
        visualizer.beginPath();
        for(let j = 0; j < frequencyBars; ++j) {
          visualizer.lineTo(j * barWidth, canvasHeight - (phase[j]*90 + 300)/Math.PI);
        }
        visualizer.stroke();
      }



      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        canvas,
        inlets,
        outlets,
        freq,
        Q,
        type,   types
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




    canvas {
      // height: 222px;
      // width: 356px;
      display: block;
      background-color: whitesmoke;
      position: absolute;
      left: 1px;
      bottom: 2px;
      // right: 1px;
      width: 100%;
      // opacity: 0;
      transition: opacity var(--transition-time)
    }



  }
</style>
