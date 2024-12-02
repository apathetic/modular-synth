<template>
  <div class="analyser">
    <div class="module-details">
      <h3>Analyser</h3>
    </div>

    <div class="module-interface">
      <canvas ref="canvas"></canvas>
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id"></Inlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, inject, ref, watch, onMounted, onUnmounted } from 'vue';
  import { useAppStore } from '@/stores/app';

  export default defineComponent({
    name: 'Analyser',

    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {
      const type = 'FFT';
      const context = inject('context');
      const store = useAppStore();
      const canvas = ref();

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

      //           = new Float32Array(analyser.frequencyBinCount);
      let buffer = new Uint8Array(analyser.frequencyBinCount);
      let ticking = true;

      let visualizer;
      let canvasWidth = 0;
      let canvasHeight = 0;

      watch(() => store.power, (isOn) => {
        if (isOn) {
          loop();
        } else {
          visualizer.clearRect(0, 0, canvasWidth, canvasHeight);
        }
      });

      onUnmounted(() => {
        buffer = null; //  ... Float32Array destroy ...??
      });

      onMounted(() => {
        visualizer = canvas.value.getContext('2d');
        canvasWidth = visualizer.canvas.width;
        canvasHeight = visualizer.canvas.height;
      });


      function analyse() {
        if (type === 'FFT') {
          analyser.getByteFrequencyData(buffer);
        } else {
          analyser.getFloatTimeDomainData(buffer);
        }
      }

      function render() {
        visualizer.fillStyle = 'rgb(0 0 0)';
        visualizer.fillRect(0, 0, canvasWidth, canvasHeight);

        if (type === 'FFT') {
          const values = buffer;
          const barWidth = canvasWidth / values.length;
          let x = 0;

          visualizer.clearRect(0, 0, canvasWidth, canvasHeight);

          for (const val of values) {
            visualizer.fillStyle = `rgba(0,222,0, ${val / 255})`;  // 0 -> 255 when getByteData
            visualizer.fillRect(x, canvasHeight - val / 2, barWidth, val / 2);

            x += barWidth + 1;
          }
        } else {
          //   waveContext.clearRect(0, 0, canvasWidth, canvasHeight);
          //   var values = waveform.analyse();
          //   waveContext.beginPath();
          //   waveContext.lineJoin = "round";
          //   waveContext.lineWidth = 6;
          //   waveContext.strokeStyle = waveformGradient;
          //   waveContext.moveTo(0, (values[0] / 255) * canvasHeight);
          //   for (var i = 1, len = values.length; i < len; i++){
          //     var val = values[i] / 255;
          //     var x = canvasWidth * (i / len);
          //     var y = val * canvasHeight;
          //     waveContext.lineTo(x, y);
          //   }
          // waveContext.stroke();
        }
      }

      function loop() {
        if (store.power) {
          if (!store.isEditing && ticking) {
            analyse();
            render();
          }

          ticking = !ticking;

          window.requestAnimationFrame(loop);
        }
      }

      // AUDIO
      expose({
        inlets
      });

      // UI
      return {
        canvas,
        inlets
      }
    }
  });

</script>


<style lang="scss">
  .analyser {

    .module-interface {
      padding: 14px 1px 1px;
    }
    canvas {
      height: 222px;
      width: 356px;
      display: block;
      // left: 1px;
      // opacity: 0;
      transition: opacity var(--transition-time)
    }
  };
</style>
