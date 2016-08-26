<template>
  <div
  class="knob"
  @mousedown.stop.prevent="start">
    <div v-el:notch class="notch"></div>
    <span>{{ value }}</span>
  </div>
</template>


<script>
export default {
  props: {
    'value': 0,
    'min': 0,
    'max': 100
  },

  data() {
    return {
      active: false,    // to distinguish between multiple knobs
      startValue: null,
      startClientY: null
    };
  },

  ready() {
    this.setRotationDegrees();
  },

  created() {
    var self = this;

    window.addEventListener('mouseup', (e) => {
      window.mouseDown = false;
      self.active = false;

      document.body.style.webkitUserSelect = 'auto';
      document.body.style.userSelect = 'auto';
    });

    window.addEventListener('mousemove', (e) => {
      if (window.mouseDown && self.active) {
        // self.update.call(self);

        let change = self.startClientY - e.clientY;
        // let dialSpeed = 1; change *= dialSpeed;
        let value = self.startValue + change;

        value = Math.min(self.max, Math.max(self.min, value));

        self.value = Math.round(value);
        self.setRotationDegrees();
      }
    });
  },

  methods: {
    start(e) {
      window.mouseDown = true;
      this.active = true;
      this.startValue = this.value;
      this.startClientY = e.clientY;

      // document.body.style.webkitUserSelect = 'none';
      // document.body.style.userSelect = 'none';
    },

    update(e) {
      console.log(e.target);

      let change = this.startClientY - e.clientY;
      // let dialSpeed = 1; change *= dialSpeed;
      let value = this.startValue + change;

      // value = Math.min(this.max, Math.max(this.min, value));
      value = Math.min(100, Math.max(0, value));

      this.value = Math.round(value);
      this.setRotationDegrees();
    },

    /**
     * Set the knob's notch position
     */
    setRotationDegrees() {
      let dialOffsetLow = -160;
      let dialOffsetHigh = 160;
      let maxDegreeShift = dialOffsetHigh - dialOffsetLow;
      let value = (this.value - this.min) / (this.max - this.min);
      let rotationValue = (value * maxDegreeShift) + dialOffsetLow;

      this.$els.notch.style['transform'] = 'rotate(' + rotationValue + 'deg)';
    }
  }
};

</script>


<style lang="scss">
  .knob {
    width: 50px;
    height: 50px;
    display: inline-block;
    border: 3px #ddd solid;
    border-radius: 30px;
    margin: 1em;
    cursor: pointer;
    background: radial-gradient(ellipse at center 45%, rgba(255,255,255,1) 25%,rgba(40,40,40,0.3) 100%);
    box-shadow: 0px 3px 2px #666;

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
      font-size: 11px;

      top: 2.5em;
      position: relative;
      color: black;
    }
  }
</style>
