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
      id: null,
      module: Object
    },

    computed: {
      ...mapGetters([
        'power',
        'editing'
      ])
    },

    data() {
      return {
        inlets: [
          { label: 'input' }
        ]
      };
    },

    created() {
      this.analyser = this.inlets[0].audio = this.context.createAnalyser();
      this.analyser.fftSize = 512; // 1024;
      this.analyser.maxDecibels = -30;
      this.analyser.minDecibels = -100;

      this._buffer = new Float32Array(this.analyser.frequencyBinCount);
      this._type = 'FFT';
      this.ticking = true;

      this.$watch('power', (on) => {
        if (on) {
          this.loop();
        } else {
          // set buffer to 0 and update display
          this.visualizer.clearRect(0, 0, 222, 356);
        }
      });
    },

    destroyed() {
      // this.analyser.disconnect();// this is done in Connection

      this._buffer = null; //  ... Float32Array destroy ...??
    },

    mounted() {
      this.visualizer = this.$refs.visualization.getContext('2d');
    },

    methods: {
      // from Tone.js
      analyse() {
        if (this._type === 'FFT') {
          // FFT
          this.analyser.getFloatFrequencyData(this._buffer);
        } else {
          // waveform
          this.analyser.getFloatTimeDomainData(this._buffer);
          // } else {
          //   var uint8 = new Uint8Array(this._buffer.length);
          //   this.analyser.getByteTimeDomainData(uint8);
          //   // referenced https://github.com/mohayonao/get-float-time-domain-data
          //   // POLYFILL
          //   for (var i = 0; i < uint8.length; i++){
          //     this._buffer[i] = (uint8[i] - 128) * 0.0078125;
          //   }
          // }
        }
      },

      render() {
        const values = this._buffer;
        const length = values.length;
        const canvasWidth = this.visualizer.canvas.width;
        const canvasHeight = this.visualizer.canvas.height;
        const barWidth = canvasWidth / length;

        this.visualizer.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = 0, x = 0; i < length; i++) {
          let val = values[i] + 140; // why 140? no idea. Came from Mozilla docs

          // val = isFinite(val) ? val : 0;

          this.visualizer.fillStyle = 'rgba(0, 222, 0, ' + val / 140 + ')';
          // this.visualizer.fillStyle = 'rgb(0, 222, 0)';
          this.visualizer.fillRect(x, canvasHeight - val, barWidth, val);

          x += barWidth + 1;
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
      padding: 0;
    }
    canvas {
      height: 222px;
      width: 356px;
      display: block;
      left: 1px;
      opacity: 0;
      transition: opacity $transition-time;
    }

    &.analysing {
      canvas {
        opacity: 1;
      }
    }
  };
</style>
