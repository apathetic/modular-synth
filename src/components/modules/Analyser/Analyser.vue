<script lang="ts">
  import { defineComponent, inject, ref, watch, onMounted, onUnmounted } from 'vue';
  import { useAppStore } from '@/stores/app';

  type Mode = 'FFT' | 'scope';

  export default defineComponent({
    name: 'Analyser',

    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {
      const context = inject('context') as AudioContext;
      const store = useAppStore();
      const canvas = ref<HTMLCanvasElement>();
      const mode = ref<Mode>('FFT');

      const analyser = context.createAnalyser();
      analyser.fftSize = 256; // 512;
      analyser.maxDecibels = -20; // max value to represent; any freq bins with amplitude above this will be 255
      analyser.minDecibels = -90; // min value to represent; any freq bins with amplitude below this will be 0

      const inlets = [
        {
          label: 'input',
          audio: analyser
        }
      ];

      // Two buffers because frequency data and time-domain data have
      // different lengths: `frequencyBinCount` (= fftSize/2) vs `fftSize`.
      let fftBuffer: Uint8Array | null = new Uint8Array(analyser.frequencyBinCount);
      let timeBuffer: Uint8Array | null = new Uint8Array(analyser.fftSize);
      let ticking = true;
      // `mounted` gates the rAF cycle. Without it the loop keeps scheduling
      // frames after the component unmounts — eventually calling `analyse()`
      // with a nulled buffer and throwing.
      let mounted = true;

      let visualizer: CanvasRenderingContext2D | undefined;
      let canvasWidth = 0;
      let canvasHeight = 0;

      // Cached at mount from `--color-highlight`. `highlightRgb` is the
      // comma-separated triplet for building `rgba(..., alpha)` fills
      // without re-parsing on every frame.
      let highlightColor = '#54bfff';
      let highlightRgb = '84, 191, 255';

      watch(() => store.power, (isOn) => {
        if (isOn) {
          loop();
        } else {
          visualizer?.clearRect(0, 0, canvasWidth, canvasHeight);
        }
      });

      onUnmounted(() => {
        mounted = false;
        fftBuffer = null;
        timeBuffer = null;
      });

      onMounted(() => {
        const el = canvas.value!;
        // Size the pixel buffer to match the CSS-rendered size so drawing
        // math isn't stretched. `clientWidth/Height` is reliable here: the
        // parent `.module-interface` uses `visibility: hidden` in edit mode
        // (not `display: none`), so layout is always computed.
        el.width = el.clientWidth;
        el.height = el.clientHeight;

        visualizer = el.getContext('2d')!;
        canvasWidth = el.width;
        canvasHeight = el.height;

        const raw = getComputedStyle(el).getPropertyValue('--color-highlight').trim();
        if (raw) {
          highlightColor = raw;
          const rgb = hexToRgb(raw);
          if (rgb) highlightRgb = rgb.join(', ');
        }

        // The watch above only fires on power TOGGLES. If the Analyser is
        // added to the rack after power is already on, kick the loop here.
        if (store.power) loop();
      });

      function toggleMode() {
        mode.value = mode.value === 'FFT' ? 'scope' : 'FFT';
        // Wipe the canvas so the outgoing mode's artifacts don't linger
        // while the first frame of the new mode is being computed.
        visualizer?.clearRect(0, 0, canvasWidth, canvasHeight);
      }

      function analyse() {
        if (mode.value === 'FFT') {
          if (!fftBuffer) return;
          analyser.getByteFrequencyData(fftBuffer);
        } else {
          if (!timeBuffer) return;
          analyser.getByteTimeDomainData(timeBuffer);
        }
      }

      function render() {
        if (!visualizer) return;

        visualizer.clearRect(0, 0, canvasWidth, canvasHeight);

        if (mode.value === 'FFT') {
          renderFFT();
        } else {
          renderScope();
        }
      }

      /** Vertical bars, one per frequency bin, alpha proportional to amplitude. */
      function renderFFT() {
        if (!visualizer || !fftBuffer) return;
        const values = fftBuffer;
        const barWidth = canvasWidth / values.length;
        let x = 0;

        for (const val of values) {
          visualizer.fillStyle = `rgba(${highlightRgb}, ${val / 255})`;
          visualizer.fillRect(x, canvasHeight - val / 2, barWidth, val / 2);
          x += barWidth + 1;
        }
      }

      /** Oscilloscope: single polyline across the full buffer. 128 is zero. */
      function renderScope() {
        if (!visualizer || !timeBuffer) return;
        const values = timeBuffer;
        const step = canvasWidth / values.length;

        visualizer.lineWidth = 2;
        visualizer.strokeStyle = highlightColor;
        visualizer.beginPath();

        for (let i = 0; i < values.length; i++) {
          // `val` is 0..255 with 128 == zero crossing. Map to canvas Y
          // with 0 at top, so higher amplitude sits lower on screen at the
          // far end of the range — flip so positive peaks point up.
          const x = i * step;
          const y = ((255 - values[i]) / 255) * canvasHeight;
          if (i === 0) visualizer.moveTo(x, y);
          else visualizer.lineTo(x, y);
        }

        visualizer.stroke();
      }

      function loop() {
        if (!mounted || !store.power) return;

        if (!store.isEditing && ticking) {
          analyse();
          render();
        }

        ticking = !ticking;

        window.requestAnimationFrame(loop);
      }

      // AUDIO
      expose({
        inlets
      });

      // UI
      return {
        canvas,
        inlets,
        mode,
        toggleMode,
      }
    }
  });

  /** Parse `#rgb`, `#rrggbb` to `[r, g, b]`. Returns undefined if it can't. */
  function hexToRgb(hex: string): [number, number, number] | undefined {
    const m = hex.trim().replace(/^#/, '');
    if (m.length === 3) {
      const r = parseInt(m[0] + m[0], 16);
      const g = parseInt(m[1] + m[1], 16);
      const b = parseInt(m[2] + m[2], 16);
      if ([r, g, b].every(Number.isFinite)) return [r, g, b];
    }
    if (m.length === 6) {
      const r = parseInt(m.slice(0, 2), 16);
      const g = parseInt(m.slice(2, 4), 16);
      const b = parseInt(m.slice(4, 6), 16);
      if ([r, g, b].every(Number.isFinite)) return [r, g, b];
    }
    return undefined;
  }
</script>


<template>
  <div class="analyser">
    <div class="module-details">
      <h3>Analyser</h3>
    </div>

    <div class="module-interface">
      <canvas ref="canvas"></canvas>
      <button
        type="button"
        class="mode-toggle"
        :title="`Switch to ${mode === 'FFT' ? 'scope' : 'FFT'}`"
        @click="toggleMode"
      >{{ mode }}</button>
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id"></Inlets>
    </div>
  </div>
</template>


<style>
  .analyser {

    .module-interface {
      padding: 14px 1px 1px;
      position: relative;
    }
    canvas {
      height: 222px;
      width: 356px;
      display: block;
      transition: opacity var(--transition-time)
    }

    .mode-toggle {
      position: absolute;
      top: 18px;
      right: 6px;
      padding: 2px 6px;
      font-size: 0.7rem;
      font-family: var(--font-secondary);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-highlight);
      background: rgba(0, 0, 0, 0.45);
      border: 1px solid var(--color-highlight);
      border-radius: 2px;
      cursor: pointer;
      line-height: 1;
      opacity: 0.7;
      transition: opacity var(--transition-time);

      &:hover { opacity: 1; }
    }
  }
</style>
