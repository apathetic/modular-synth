<!--
TODO
Make this into a webworker
https://www.w3.org/TR/webaudio/#todo-fix-up-this-example.-a-volume-meter-and-clip-detector
-->

<template>
  <canvas class="vu" ref="vu"></canvas>
</template>


<script lang="ts">
  // import { mapGetters } from 'vuex';
  import { mapState } from 'pinia';
  import { useAppStore } from '@/stores/app';
  import { Meter } from '@/audio';

  export default {
    name: 'ui-VU',

    computed: {
      // ...mapGetters(['power'])
      ...mapState(useAppStore, ['power']),
    },

    props: {
      audio: {
        type: AudioNode,
        default: null
      }
    },

    created() {
      this.meter = new Meter();
      this.ticking = true;

      this.$watch('power', (on) => {
        if (on) {
          this.loop();
        } else {
          // set buffer to 0 and update display
          this.meterContext.clearRect(0, 0, 20, 132);
        }
      });
    },

    unmounted() {
      // clean up METER // TODO
    },

    mounted() {
      const meterContext = this.meterContext = this.$refs.vu.getContext('2d');
      const meterGraident = this.meterGraident = meterContext.createLinearGradient(0, 0, 0, 132);

      this.audio.connect && this.audio.connect(this.meter.input);

      meterContext.canvas.width = 20;
      meterContext.canvas.height = 132;

      meterGraident.addColorStop(0, '#BFFF02');
      meterGraident.addColorStop(0.8, '#02FF24');
      meterGraident.addColorStop(1, '#FF0202');
    },

    methods: {
      draw() {
        this.meter.process();
        this.rms = this.meter.rms;
        this.peak = this.meter.peak;

        const meterContext = this.meterContext;
        const level = this.rms * 2;

        //                     x, y, width, height
        meterContext.clearRect(0, 0, 20, 132);
        meterContext.fillStyle = this.meterGraident;    // fill relevant bits with gradient
        meterContext.fillRect(0, 0, 20, 132);
        meterContext.fillStyle = 'black';               // paint VU black
        meterContext.fillRect(0, 132 * level, 20, 132);
      },

      loop() {
        if (this.power) { // TODO check for this.editing, here?
          this.ticking && this.draw();
          this.ticking = !this.ticking;

          window.requestAnimationFrame(this.loop);
        }
      }
    }
  };
</script>


<style lang="scss">
  canvas.vu {
    background: black;
    width: 20px;
    height: 132px;
    transform: rotate(180deg); // meh, i dont feel like figuring out the math in the x,y drawing
  }
</style>
