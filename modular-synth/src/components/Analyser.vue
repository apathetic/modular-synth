<template>
  <div
  class="analyser module _6U"
  :class="{dragging: dragging, analysing: power}"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
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
  import { draggable } from '../mixins/draggable';

  export default {
    mixins: [draggable],
    props: {
      id: null,
      col: null,
      row: null
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
      this.analyser.fftSize = 256; // 1024;
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
        }
      });

      console.log('%c[module] Creating Analyser', 'color: blue');
    },

    destroyed() {
      // this.analyser.disconnect();// this is done in Connection

      // this._buffer: ... Float32Array destroy ...??
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
          // if (this.isFunction(AnalyserNode.prototype.getFloatTimeDomainData)) {
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

      // renderSpectrum
      render() {
        const values = this._buffer;
        const length = values.length;
        const canvasWidth = this.visualizer.canvas.width;
        const canvasHeight = this.visualizer.canvas.height;
        const barWidth = canvasWidth / length;

        this.visualizer.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = 0, x = 0; i < length; i++) {
          const val = values[i] + 140; // why 140? no idea. Came from Mozilla docs

          this.visualizer.fillStyle = 'rgba(0, 222, 0, ' + val / 140 + ')';
          // this.visualizer.fillStyle = 'rgb(0, 222, 0)';
          this.visualizer.fillRect(x, canvasHeight - val, barWidth, val);

          x += barWidth + 1;
        }
      },

      // renderWaveform(){
      //   //draw the waveform
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

      loop() {
        if (this.power) {
          if (!this.editing && this.ticking) {
            this.analyse();
            this.render();
          }

          // console.log(this._buffer);
          // this.ticking = false;
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
