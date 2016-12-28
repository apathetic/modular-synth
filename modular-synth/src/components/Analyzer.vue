<template>
  <div
  class="module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.prevent="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      {{ position }}<br><br>
    </div>

    <div class="module-connections">
      <inlets ports="inlets"></inlets>
      <outlets ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
  import { draggable } from '../mixins/draggable';
  import { newConnection } from '../store/actions';
  import { rackWidth, rackHeight } from '../dimensions';
  import store from '../store/store'; // .... er...

  export default {
    mixins: [draggable],

    vuex: {
      actions: {
        newConnection
      }
    },

    props: {
      id: null,
      col: null,
      row: null
    },

    computed: {
      position() {
        return {
          left: (store.state.editing || this.dragging) ? this.x + 'px' : this.col * rackWidth + 'px',
          top: (store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
        };
      }
    },

    data() {
      return {
        name: 'Analyzer',
        w: 1, // width
        h: 2, // height

        inlets: [
          {
            port: 0,
            label: 'input-1',
            data: null // this.input
          }
        ]
      };
    },

    created() {
      this.inlets[0].data = this.context.createGain();
      // this.analyzer = new SpectrumAnalyzer(this.inlets[0].data, 0, 100);
      this.analyser = this.context.createAnalyser();

      /*
        function SpectrumAnalyzer (audioNode, minRange, maxRange) {
            this.audioNode = audioNode;
            this.analyser = audioCtx.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.maxDecibels = 0;
            this.analyser.minDecibels = -100;
            this.array = new Float32Array(this.analyser.frequencyBinCount);
            this.minRange = minRange ||  0;
            this.maxRange = maxRange ||  audioCtx.sampleRate;
            audioNode.connect(this.analyser);
        }

        SpectrumAnalyzer.prototype = {
            update: function () {
                this.analyser.getFloatFrequencyData(this.array);
            },
            render: function (ctx) {
                var length = this.array.length;
                var fftSize = this.analyser.fftSize;
                var W = ctx.canvas.width;
                var H = ctx.canvas.height;
                var minDb = this.analyser.minDecibels;
                var maxDb = this.analyser.maxDecibels;
                var fy = function (y) {
                    y = (y-minDb)/(maxDb-minDb); // normalize
                    return (1-y) * H;
                }
                ctx.clearRect(0,0,W,H);
                ctx.beginPath();
                ctx.fillStyle = "#acd";
                ctx.moveTo(0, H);
                var iStart = Math.floor(fftSize*this.minRange/audioCtx.sampleRate);
                var iStop = Math.floor(fftSize*this.maxRange/audioCtx.sampleRate);
                var range = iStop-iStart;
                for (var i=iStart; i<=iStop; ++i) {
                    ctx.lineTo(W*(i-iStart)/range, fy(this.array[i]));
                }
                ctx.lineTo(W, H);
                ctx.fill();

                var step = GridUtils.findNiceRoundStep(this.maxRange, 4);
                var prefix = step>=1000 ? "k" : "";
                ctx.fillStyle = "#357";
                for (var i=this.minRange+step; i<this.maxRange; i+=step) {
                    var text = prefix=="k" ? Math.round(i/1000) : i;
                    var x = W*i/this.maxRange;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, 5);
                    ctx.stroke();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";
                    ctx.font = "14px sans-serif";
                    ctx.fillText(text, x, 6);
                }
                ctx.textAlign = "right";
                ctx.fillStyle = "#79b";
                ctx.fillText("freq in "+prefix+"Hz", W, 20);
                ctx.font = "14px sans-serif";
            }
      */

    }
  };

</script>
