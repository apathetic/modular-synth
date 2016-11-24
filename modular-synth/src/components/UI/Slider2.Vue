<template>
  <div class="slider" @mousedown.stop.prevent="update">
    <!-- <input
      type="range"
      orient="vertical"
      min="{{ min }"}
      max="{{ max }}"
      step="{{ step }}"
      value="{{ value }}"
      @input.stop.prevent="update">
    </input> -->


      <div style="fill" style="top: {{ value }}"></div>

    {{ value }}
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
      step: 1
    };
  },

  created() {
    const self = this;

    // this.range = (this.max - this.min) / 100;
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

      this.value = this.startValue + delta;
      console.log(this.value);
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
    // user-select: none;

    // ...background-color: rgb(213, 45, 255); height: 20px; width: 50px; position: absolute;

    .fill {
      opacity: 0.38;
      background-color: rgb(213, 45, 255);
      position: absolute;
      height: 100%;
      transform: translateY(-100%);
    }
  }

</style>
