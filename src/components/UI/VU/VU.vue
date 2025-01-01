<!--
TODO
Make this into a webworker
https://www.w3.org/TR/webaudio/#todo-fix-up-this-example.-a-volume-meter-and-clip-detector
-->

<template>
  <canvas class="vu" ref="vu"></canvas>
</template>


<script lang="ts">
  import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import { Meter } from 'tone';
  import { useAppStore } from '@/stores/app';
  // import { Meter } from '@/audio';
  // import type { ToneAudioNode } from 'tone';

  const WIDTH = 16;
  const HEIGHT = 132;

  export default defineComponent({
    name: 'VU',

    props: {
      audio: {
        // type: any,//ToneAudioNode,//<GainOptions<'gain'>>,
        default: null,
        required: true,
      }
    },

    setup(props, { expose }) {
      const store = useAppStore();
      const power = computed(() => store.power);
      /*


      let ticking = true;
      const meter = new Meter();
      const vu = ref();

      props.audio.connect(meter);

      watch(power, (on) => {
        if (on) {
          loop();
        } else {
          // set buffer to 0 and update display
          meterContext.clearRect(0, 0, 20, HEIGHT);
        }
      });

      onUnmounted(() => {
        // clean up METER // TODO
      });

      onMounted(() => {
        // const meterContext = this.meterContext = this.$refs.vu.getContext('2d');
        // const meterGraident = this.meterGraident = meterContext.createLinearGradient(0, 0, 0, HEIGHT);
        const meterContext = vu.getContext('2d');
        const meterGraident = this.meterGraident = meterContext.createLinearGradient(0, 0, 0, HEIGHT);

        this.audio.connect && this.audio.connect(this.meter.input);

          meterContext.canvas.width = WIDTH;
          meterContext.canvas.height = HEIGHT;

        meterGraident.addColorStop(0, '#BFFF02');
        meterGraident.addColorStop(0.8, '#02FF24');
        meterGraident.addColorStop(1, '#FF0202');
      })

      function draw() {
        meter.process();
        this.rms = this.meter.rms;
        this.peak = this.meter.peak;

        const meterContext = this.meterContext;
        const level = this.rms * 2;

        //                     x, y, width, height
        // meterContext.clearRect(0, 0, 20, 132);
        // meterContext.fillStyle = this.meterGraident;    // fill relevant bits with gradient
        // meterContext.fillRect(0, 0, 20, 132);
        // meterContext.fillStyle = 'black';               // paint VU black
        // meterContext.fillRect(0, 132 * level, 20, 132);


        //                   x, y, w, h.  From upper-left
        meterContext.fillStyle = 'black';               // paint VU black
        meterContext.fillRect(0, 0, WIDTH, HEIGHT);
        meterContext.fillStyle = this.meterGraident;    // fill relevant bits with gradient
        meterContext.fillRect(0, 0, WIDTH, HEIGHT * level);


      }

      function loop() {
        if (power) {
          ticking && draw();
          ticking = !ticking;
          window.requestAnimationFrame(loop);
        }
      }

      // AUDIO
      // expose({
      //   meter
      // });

      // UI
      return {
        vu
      }
      /* */
    }
  });
</script>


<style lang="scss">
  canvas.vu {
    background: black;
    width: 16px;
    height: 132px;

    // b/c coords start at top-left, not bottom, and we draw from top -> down. however, VU paints from bottom -> up
    rotate: 180deg;
  }
</style>
