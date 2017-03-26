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
  import { draggable } from '../mixins/draggable';

  export default {
    mixins: [draggable],
    props: {
      id: null,
      col: null,
      row: null
    },

    data() {
      return {
        name: 'Analyser',
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
      this.analyser.fftSize = 1024;
      this.analyser.maxDecibels = 0;
      this.analyser.minDecibels = -100;

      this._buffer = new Float32Array(this.analyser.frequencyBinCount);
      this._type = 'FFT';
    },

    mounted() {
      this.canvas = this.$refs.visualization.getContext('2d');
      this.loop();
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

      // renderFFT
      render() {
        const values = this._buffer;
        const barWidth = this.canvas.width / this.analyser.fftSize;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        this.canvas.clearRect(0, 0, canvasWidth, canvasHeight);

        for (let i = 0, len = values.length; i < len; i++) {
          const val = values[i] / 255;
          const x = canvasWidth * (i / len);
          const y = val * canvasHeight;

          this.canvas.fillStyle = 'rgba(0, 0, 0, ' + val + ')';
          this.canvas.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
        }
      },

      // renderWaveform(values){
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
        this.analyse();
        this.render();

        // window.requestAnimationFrame(this.loop);  // .bind(this)
      }
    }
  };

</script>
