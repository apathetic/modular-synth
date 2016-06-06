<template>
  <div v-on:mousedown="knobStart" class="knob">
    <div v-el:notch class="notch"></div>
    <span>{{ param }}</span>
  </div>
</template>


<script>
export default {
  prop: ['value'],

  data() {
    return {
      percentage: 0,
      active: false,    // to distinguish between multiple knobs
      rotationValue: 0,
      // clientYDown: null,
      startValue: null
    };
  },

  created() {
    let dialOffsetLow = -70;
    let dialOffsetHigh = 250;
    let maxDegreeShift = 320;
    let dialSpeed = 0.5;
    let rotationValue = dialOffsetLow;

    // Get the correct degree shift based on dial speed
    maxDegreeShift = maxDegreeShift * dialSpeed;

    var self = this;

    window.addEventListener('mouseup', (e) => {
      window.mouseDown = false;
      self.active = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (window.mouseDown && self.active) {
        // Difference between starting Y and current Y
        let clientYDiff = e.clientY - self.startValue;

        // Set value of dial based on the position of it previous to this mousedown/move event
        self.value = self.startValue - clientYDiff;
        self.value = Math.min(maxDegreeShift, Math.max(0, self.value));

        // For every dialSpeed moved by mouse, we move a degree
        rotationValue = ((self.value / dialSpeed) + dialOffsetLow);

        // Only rotate within our boundaries
        if (rotationValue > dialOffsetLow && rotationValue < dialOffsetHigh) {
          self.setRotationDegrees(rotationValue);
        }

        self.percentage = (self.value / maxDegreeShift) * 100;

        console.log(self.percentage, rotationValue);

        // this.onAdjust(self.percentage);
      }
    });
  },

  methods: {
    knobStart(e) {
      window.mouseDown = true;
      this.active = true;
      this.rotationValue = this.getRotationDegrees();
      this.startValue = e.clientY;

      window
    },

    // onAdjust(percentage) {
    //   //
    // },

    getRotationDegrees() {
      var matrix = this.$els.notch.style['transform'];
      var angle;

      if (matrix !== '') {
        let values = matrix.split('(')[1].split(')')[0].split(',');
        let a = values[0];
        let b = values[1];
        angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
      } else {
        angle = 0;
      }

      return angle;
    },

    setRotationDegrees(degree) {
      console.log(degree);
      this.$els.notch.style['transform'] = 'rotate(' + degree + 'deg)';
    }
  }


    //   // Bind into jQuery.
    //   $.fn.dial = function (options) {

    //     // For each instance of the selector, create the plugin
    //     return this.each(function () {

    //       if (!$.data(this, 'plugin_dial')) {
    //         $.data(this, 'plugin_dial', new dial(this, options));
    //       }

    //     });
    //   }

    // })(jQuery);


    // var context = new webkitAudioContext();

    // $('#osc .dial').dial({
    //   node: context.createOscillator(),
    //   onInit: function () {
    //     this.node.connect(context.destination);
    //     this.node.noteOn(0);
    //   },
    //   onAdjust: function (percentage) {
    //     this.node.frequency.value = percentage * 300;
    //   }
    // });
};

</script>

<style lang="scss">
  .knob {
    width: 50px;
    height: 50px;
    border: 3px #ddd solid;
    border-radius: 30px;
    cursor: pointer;
    background: radial-gradient(ellipse at center, rgba(255,255,255,1) 0%,rgba(40,40,40,0.4) 100%);
    box-shadow: 0px 0px 3px #000;

    .notch {
      width: 2px;
      height: 25px;
      position: relative;
      left: 50%;
      background: red;
      transform-origin: center bottom;
      transform: rotate(-160deg);
      margin-left: -1px;
    }

    span {
      font-family: sans-serif;
      text-align: center;
      width: 100%;
      display: inline-block;
      color: #fff;
      font-size: 11px;
    }
  }
</style>
