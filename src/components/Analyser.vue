<template>
  <div class="analyser">
    <div class="module-details">
      <h3>Analyser</h3>
    </div>

    <div class="module-interface">
      <canvas ref="visualization"></canvas>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
    </div>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';

  export default {
    props: {
      id: null
    },

    computed: {
      ...mapGetters([
        'power',
        'editing'
      ])
    },

    data() {
      return {
        name: 'Analyser',
        inlets: [
          { label: 'input' }
        ]
      };
    },

    created() {
      this.analyser = this.inlets[0].audio = this.context.createAnalyser();
      this.analyser.fftSize = 256; // 512;
      this.analyser.maxDecibels = -20; // max value to represent; any freq bins with amplitude above this will be 255
      this.analyser.minDecibels = -90; // min value to represent; any freq bins with amplitude below this will be 0

      // this._buffer = new Float32Array(this.analyser.frequencyBinCount);
      this._buffer = new Uint8Array(this.analyser.frequencyBinCount);
      this._type = 'FFT';
      this.ticking = true;

      this.$watch('power', (on) => {
        if (on) {
          this.loop();
        } else {
          // set buffer to 0 and update display
          // this._buffer.forEach(sample => sample = 0);
          this.visualizer.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
      });
    },

    destroyed() {
      // this.analyser.disconnect();// this is done in Connection

      this._buffer = null; //  ... Float32Array destroy ...??
    },

    mounted() {
      this.visualizer = this.$refs.visualization.getContext('2d');
      this.canvasWidth = this.visualizer.canvas.width;
      this.canvasHeight = this.visualizer.canvas.height;
    },

    methods: {
      analyse() {
        if (this._type === 'FFT') {
          // this.analyser.getFloatFrequencyData(this._buffer);
          this.analyser.getByteFrequencyData(this._buffer);
        } else {
          this.analyser.getFloatTimeDomainData(this._buffer);
        }
      },

      render() {
        if (this._type === 'FFT') {
          const values = this._buffer;
          const h = this.canvasHeight;
          const w = this.canvasWidth;
          const barWidth = w / values.length;
          let x = 0;

          this.visualizer.clearRect(0, 0, w, h);

          for (const val of values) {
            this.visualizer.fillStyle = `rgba(0,222,0, ${val / 255})`;  // 0 -> 255 when getByteData
            this.visualizer.fillRect(x, h - val / 2, barWidth, val / 2);
            // this.visualizer.fillRect(x, canvasHeight - val, barWidth, val);

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
      },

      loop() {
        if (this.power) {
          if (!this.editing && this.ticking) {
            this.analyse();
            this.render();
          }

          this.ticking = !this.ticking;

          window.requestAnimationFrame(this.loop);  // .bind(this)
        }
      }
    }
  };

</script>

<style lang="scss">
  @import '../assets/scss/variables.scss';

  .analyser {
    overflow: hidden;

    .module-interface {
      padding: 14px 1px 1px;
    }
    canvas {
      height: 222px;
      width: 356px;
      display: block;
      // left: 1px;
      // opacity: 0;
      transition: opacity $transition-time;
    }

    // &.analysing {
    //   canvas {
    //     opacity: 1;
    //   }
    // }
  };
</style>
