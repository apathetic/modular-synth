<template>
  <div class="slider" @mousedown.stop.prevent="start">

      <div class="fill" style="bottom: {{ sliderValue }}%"></div>

    <!-- {{ value }} -->
  </div>
</template>


<script>
// const size = 48;  // same as knob

export default {
  props: {
    label: 'Slider',
    value: 0,
    min: 0,
    max: 100
  },

  data() {
    return {
      active: false,
      startValue: 0,
      startClientY: null,
      sliderValue: 1,
      range: 1,
      step: 1
    };
  },

  created() {
    const self = this;

    this.range = (this.max - this.min) / 100;
    this.sliderValue = this.value;
    // this.knobValue = 100 * (this.value - this.min) / (this.max - this.min);  // derive internal knobValue from value

    window.addEventListener('mouseup', (e) => {
      window.mouseDown = false;
      self.active = false;

      document.body.style.webkitUserSelect = 'auto';
      document.body.style.userSelect = 'auto';
    });

    window.addEventListener('mousemove', (e) => {
      if (window.mouseDown && self.active) {
        self.update(e);
      }
    });
  },

  methods: {
    start(e) {
      window.mouseDown = true;
      this.active = true;
      this.startValue = this.sliderValue;
      this.startClientY = e.clientY;
    },

    update(e) {
      const delta = this.startClientY - e.clientY;
      const sliderValue = Math.min(100, Math.max(0, this.startValue + delta)); // 0 -> 100 internally
      const value = Math.round(sliderValue * this.range + this.min);

      this.sliderValue = sliderValue;
      this.value = value;
    }
  }
};

</script>


<style lang="scss">
  .slider {
    background: #444;
    height: 48px;
    width: 10px;
    cursor: ns-resize;
    overflow: hidden;

    .fill {
      opacity: 0.38;
      background-color: rgb(213, 45, 255);
      position: absolute;
      height: 100%;
      width: 100%;
      transform: translateY(100%);
    }
  }

</style>
