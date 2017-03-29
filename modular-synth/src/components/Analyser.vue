<template>
  <div
  class="analyser module _3U"
  :class="dragging ? 'dragging' : ''"
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
        // buffer: null,
        inlets: [
          {
            label: 'input',
            data: null
          }
        ]
      };
    },

    created() {
      this.analyser = this.inlets[0].data = this.context.createAnalyser();
      this.analyser.fftSize = 32; // 1024;
      this.analyser.maxDecibels = 0;
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

      console.log('Creating Analyser');
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
        // return this._buffer;
      },

      // renderSpectrum
      render() {
        const values = this._buffer;
        const canvasWidth = this.visualizer.canvas.width;
        const canvasHeight = this.visualizer.canvas.height;
        // const barWidth = canvasWidth / this.analyser.fftSize;
        const barWidth = canvasWidth / values.length;

        this.visualizer.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = 0, len = values.length; i < len; i++) {
          const val = values[i] / 255 * -1;
          const x = canvasWidth * (i / len);
          const y = val * canvasHeight;

          this.visualizer.fillStyle = '#357'; // 'rgba(0, 0, 0, ' + val + ')';
          this.visualizer.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
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
  .analyser {
    .module-interface {
      padding: 0;
    }
    canvas {
      // background: rgba(0,222,0, 0.2);
      height: 223px;
      width: 358px;
      }
  };
</style>
