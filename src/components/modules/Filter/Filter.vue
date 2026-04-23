<script lang="ts">
  import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue';
  import { Filter, FILTER_TYPES, type FilterType } from '@/audio/modules/filter';

  /*
    Thin UI shell around `Filter`. Owns the knob-bound reactive refs and
    the response-curve canvas; all DSP (nodes, mod path, port wiring)
    lives in the class.
  */
  export default defineComponent({
    name: 'Filter',

    props: {
      id: {
        default: undefined,
        required: true,
      },
    },

    setup(_props, { expose }) {
      const types = FILTER_TYPES;
      const type  = ref<FilterType>(types[0]);
      const freq  = ref(440);
      const Q     = ref(1);
      const canvas = ref<HTMLCanvasElement | null>(null);

      const filterModule = new Filter({
        type:      type.value,
        frequency: freq.value,
        Q:         Q.value,
      });

      // Pre-allocated buffers for `getFrequencyResponse` — reused on
      // every redraw so we're not churning typed arrays per keystroke.
      const frequencies   = new Float32Array(100);
      const magResponse   = new Float32Array(frequencies.length);
      const phaseResponse = new Float32Array(frequencies.length);
      for (let i = 0; i < frequencies.length; i++) {
        frequencies[i] = 20 * Math.pow(2, i / 10); // 20Hz..20kHz, log-spaced
      }

      function drawFilterCurve() {
        const el = canvas.value;
        if (!el) return;

        const ctx = el.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, el.width, el.height);
        filterModule.getFrequencyResponse(frequencies, magResponse, phaseResponse);

        ctx.beginPath();
        ctx.strokeStyle = '#00ccff';
        ctx.lineWidth   = 2;

        for (let i = 0; i < frequencies.length; i++) {
          const x = (i / frequencies.length) * el.width;
          const y = (1 - magResponse[i]) * el.height;
          if (i === 0) ctx.moveTo(x, y);
          else         ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      watch(freq, (f) => { filterModule.frequency = f; drawFilterCurve(); });
      watch(Q,    (q) => { filterModule.Q         = q; drawFilterCurve(); });
      watch(type, (t) => { filterModule.type      = t; drawFilterCurve(); });

      onMounted(drawFilterCurve);
      onUnmounted(() => filterModule.destroy());

      // AUDIO
      expose({
        inlets:  filterModule.inlets,
        outlets: filterModule.outlets,
      });

      // UI
      return {
        inlets:  filterModule.inlets,
        outlets: filterModule.outlets,
        freq,
        Q,
        type,
        types,
        canvas,
      };
    },
  });
</script>


<template>
  <div class="filter">
    <div class="module-details">
      <h3>Filter</h3>
    </div>

    <div class="module-interface">
      <Knob param="freq" @value="freq = $event" :min="100" :max="12000" mode="log"></Knob>
      <Knob param="Q"    @value="Q = $event"    :min="0"   :max="1" :precision="2"></Knob>
      <Dropdown param="type" @value="type = $event" :options="types"></Dropdown>

      <canvas ref="canvas" width="100" height="50"></canvas>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .filter {
    --grey: var(--module-surface);
    --teal: #2c6c6d;

    background-image: radial-gradient(
      circle,
      var(--grey) 0%,
      var(--grey) 10%,
      var(--teal) 10%,
      var(--teal) 26%,
      var(--grey) 26%,
      var(--grey) 28%,
      var(--teal) 28%,
      var(--teal) 36%,
      var(--grey) 36%,
      var(--grey) 40%,
      var(--teal) 40%,
      var(--teal) 44%,
      var(--grey) 44%,
      var(--grey) 52%,
      var(--teal) 52%,
      var(--teal) 54%,
      var(--grey) 54%,
      var(--grey) 100%
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
      position: absolute;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
  }
</style>
