<template>
<!--
<div class="level">
    <meter orient="vertical" min="0.0" max="1.0" step="0.1" value="0.0"></meter>
    <meter orient="vertical" min="0.0" max="1.0" step="0.1" value="0.0"></meter>
    <input
      type="range"
      orient="vertical"
      min="0"
      max="1"
      step="0.1"
      value="initial"
      @input="update">
    </input>
  </div>
 -->
    <!-- { { value }} -->

    <canvas class="level" ref="meter"></canvas>

</template>


<script>
import AudioMeter from '../../assets/vendor/meter';

export default {
  props: {
    // label: '',
    // initial: 0.5
    // min: 0,
    // max: 1
    audio: null // AudioNode
  },

  data() {
    return {
      width: 500,
      height: 50,
      meter: null
    };
  },

  created() {
    console.log(this.audio);
    // const stream = 'audio input';
    // const mediaStreamSource = this.context.createMediaStreamSource(this.audio);
    //
    this.meter = AudioMeter(this.context);   // create volume meter

    console.log(this.meter);
    // mediaStreamSource.connect(this.meter);
    // this.drawLoop();
  },

  methods: {
    update(e) {
      const gain = e.target.value;

      // this.value = gain;
      this.$emit('value', gain);
    },

    drawLoop(time) {
      const canvas = this.$refs.canvas;

      canvas.clearRect(0, 0, this.width, this.height);
      canvas.fillStyle = this.meter.checkClipping() ? 'red' : 'green';
      canvas.fillRect(0, 0, this.meter.volume * this.width * 1.4, this.height);

      // set up the next visual callback
      // rafID = window.requestAnimationFrame(this.drawLoop);
      window.requestAnimationFrame(this.drawLoop);
    }


  }
};

</script>


<style lang="scss">
  @import '../../assets/scss/variables.scss';

  .level {
    display: inline-block;

    background: $color-grey;
    height: 150px;
    margin: 0 4px;
    width: 12px;
  }

  // meter,
  // input[type="range"] {
  //   writing-mode: bt-lr; /* IE */
  //   -webkit-appearance: slider-vertical; /* WebKit */
  //
  //   background: #aaa;
  //   padding: 0 5px;
  //
  //   height: 150px;
  //   width: 20px;
  //
  //   &:-webkit-slider-thumb {
  //     background-color: red;
  //     -webkit-appearance: none;
  //     border: 1px solid #000000;
  //   }
  //
  //   &:focus {
  //     outline: none;
  //   }
  //  }
</style>
