<template>
  <canvas class="level" ref="meter"></canvas>
</template>


<script>
import AudioMeter from '../../assets/vendor/meter';

export default {
  props: {
    audio: null // AudioNode
  },

  data() {
    return {
      width: 12,
      height: 150,
      meter: null
    };
  },

  created() {
    this.meter = AudioMeter(this.context);
    this.audio.connect(this.meter);
  },

  mounted() {
    this.canvas = this.$refs.meter.getContext('2d');
    this.drawLoop();
  },

  methods: {
    // update(e) {
    //   const gain = e.target.value;
    //
    //   // this.value = gain;
    //   this.$emit('value', gain);
    // },

    drawLoop(time) {
      const canvas = this.canvas;
      const val = this.meter.volume * 1.4142 * this.height; // 0 -> 150

      // console.log(val);

      canvas.clearRect(0, 0, this.width, this.height);
      canvas.fillStyle = this.meter.checkClipping() ? 'red' : 'green';
      canvas.fillRect(0, canvas.height - val, canvas.width, val);

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
