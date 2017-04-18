TODO
Make this into a webworker
https://www.w3.org/TR/webaudio/#todo-fix-up-this-example.-a-volume-meter-and-clip-detector

<template>
  <canvas class="vu" ref="vu">
</template>

<script>
import { mapGetters } from 'vuex';
import { Meter } from '../../audio';

export default {
  computed: {
    ...mapGetters([
      'power',
      'editing'
    ])
  },

  props: {
    audio: null // window.AudioNode
  },

  created() {
    this.meter = new Meter();
    this.ticking = true;

    this.$watch('power', (on) => {
      if (on) {
        this.loop();
      } else {
        // set buffer to 0 and update display
      }
    });
  },

  mounted() {
    const meterContext = this.meterContext = this.$refs.vu.getContext('2d');
    let meterGraident = this.meterGraident = meterContext.createLinearGradient(0, 0, 20, 132);

    this.audio.connect && this.audio.connect(this.meter);

    meterGraident = meterContext.createLinearGradient(0, 0, 20, 132);
    meterGraident.addColorStop(0, '#BFFF02');
    meterGraident.addColorStop(0.8, '#02FF24');
    meterGraident.addColorStop(1, '#FF0202');
  },

  methods: {
    // analyse() {
    //   const signal = this.meter.analyse();
    //   const unity = 0.35;
    //   let sum = 0;
    //   let rms;
    //
    //   for (let i = 0; i < signal.length; i++) {
    //     sum += Math.pow(signal[i], 2);
    //   }
    //
    //   rms = Math.sqrt(sum / signal.length);
    //   rms = Math.max(rms, this._lastValue * this.smoothing); // smooth it
    //
    //   this._lastValue = rms;
    //
    //   // scale the output curve
    //   return Math.sqrt(rms / unity);
    // },

    draw() {
      const level = this.meter.value * 0.8; // scale it since values go above 1 when clipping
      const meterContext = this.meterContext;

      meterContext.clearRect(0, 0, 20, 132);
      meterContext.fillStyle = this.meterGraident;
      meterContext.fillRect(0, 0, 20, 132);
      meterContext.fillStyle = 'white';
      meterContext.fillRect(20 * level, 0, 20, 132);
    },

    loop() {
      if (this.power) {
        if (!this.editing && this.ticking) {
          // this.analyse();
          this.draw();
        }

        // this.ticking = false;
        window.requestAnimationFrame(this.loop);  // .bind(this)
      }
    }
  }
};

</script>

<style lang="scss">
  canvas.vu {
    width: 20px;
    height: 132px;
  }
</style>
