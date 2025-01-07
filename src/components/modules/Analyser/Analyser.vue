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
  import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue';
  import { Analyser } from 'tone';
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
      const analyser = new Analyser('fft', 256);
      const canvas = ref<HTMLCanvasElement>();
      const store = useAppStore();
      const inlets = [
        {
          label: 'input',
          audio: analyser
        }
      ];

      let buffer = new Float32Array(analyser.size);
      let visualizer: CanvasRenderingContext2D;
      let canvasWidth = 0;
      let canvasHeight = 0;
      let ticking = true;


      onUnmounted(() => {
        // buffer = null; ///  ... Float32Array destroy ...??
        // buffer.length = 0
        analyser.dispose();
      });

      onMounted(() => {
        visualizer = canvas.value.getContext('2d');
        canvasWidth = visualizer!.canvas.width;
        canvasHeight = visualizer!.canvas.height;
      });

      watch(() => store.power, (isOn) => {
        if (isOn) {
          loop();
        } else {
          visualizer.clearRect(0, 0, canvasWidth, canvasHeight);
        }
      });


      function render() {
        const barWidth = canvasWidth / buffer.length;
        let x = 0;

        visualizer.fillStyle = 'rgb(0 0 0)';
        visualizer.fillRect(0, 0, canvasWidth, canvasHeight);
        visualizer.clearRect(0, 0, canvasWidth, canvasHeight);

        for (const val of buffer) {
          visualizer.fillStyle = `rgba(0,222,0, ${val / 255})`;  // 0 -> 255 when getByteData
          visualizer.fillRect(x, canvasHeight - val / 2, barWidth, val / 2);

          x += barWidth + 1;
        }
      }

      function loop() {
        if (store.power) {
          if (!store.isEditing && ticking) {
            buffer = <Float32Array>analyser.getValue();
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
