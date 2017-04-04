import { mapGetters } from 'vuex';

export const meter = {
  computed: {
    ...mapGetters([
      'power'
    ])
  },

  mounted() {
    this.vu = this.$refs.meter.getContext('2d');
  },

  created() {
    this.meter = this.inlets[0].audio = this.context.createAnalyser();

    // make the gradient
    // meterGraident = meterContext.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    // meterGraident.addColorStop(0, '#BFFF02');
    // meterGraident.addColorStop(0.8, '#02FF24');
    // meterGraident.addColorStop(1, '#FF0202');

    this.$watch('power', (on) => {
      if (on) {
        this.loop();
      } else {
        // set buffer to 0 and update display
      }
    });
  },

  methods: {
    analyse() {
      var signal = this.meter.analyse();
      let sum = 0;

      for (let i = 0; i < signal.length; i++) {
        sum += Math.pow(signal[i], 2);
      }

      var rms = Math.sqrt(sum / signal.length);
      // smooth it
      rms = Math.max(rms, this._lastValue * this.smoothing);
      this._lastValue = rms;
      // scale it
      var unity = 0.35;
      var val = rms / unity;
      // scale the output curve
      return Math.sqrt(val);
    },

    render() {
      // const canvasWidth = this.vu.canvas.width;
      // const canvasHeight = this.vu.canvas.height;

      // var level = meter.value * 0.8; //scale it since values go above 1 when clipping
      // meterContext.clearRect(0, 0, canvasWidth, canvasHeight);
      // meterContext.fillStyle = meterGraident;
      // meterContext.fillRect(0, 0, canvasWidth, canvasHeight);
      // meterContext.fillStyle = "white";
      // meterContext.fillRect(canvasWidth * level, 0, canvasWidth, canvasHeight);
    },

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
