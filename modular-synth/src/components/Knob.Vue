<template>
  <div v-on:mousedown="knobStart" class="knob">
    <div v-el:notch class="notch"></div>
    <span>{{ value }}</span>
  </div>
</template>


<script>
export default {
  prop: [
    'value'
  ],

  data() {
    return {
      value: 0,
      active: false,    // to distinguish between multiple knobs
      startValue: null,
      startClientY: null
    };
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
        let change = self.startClientY - e.clientY;
        // let dialSpeed = 1; change *= dialSpeed;
        let value = self.startValue + change;

        value = Math.min(100, Math.max(0, value));

        self.value = Math.round(value);
        self.setRotationDegrees(value);
      }
    });
  },

  methods: {
    knobStart(e) {
      window.mouseDown = true;
      this.active = true;
      this.startValue = this.value;
      this.startClientY = e.clientY;

      document.body.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
    },

    setRotationDegrees(value) {
      let dialOffsetLow = -160;
      let dialOffsetHigh = 160;
      let maxDegreeShift = dialOffsetHigh - dialOffsetLow;
      let rotationValue = ((value * maxDegreeShift) / 100) + dialOffsetLow;

      this.$els.notch.style['transform'] = 'rotate(' + rotationValue + 'deg)';
    }
  }
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
      font-size: 11px;

      top: 2.5em;
      position: relative;
      color: black;
    }
  }
</style>
