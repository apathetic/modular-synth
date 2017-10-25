<template>
  <div class="slider" @mousedown.stop.prevent="start">
    <div class="fill" :style="bottom"></div>
    <!-- {{ value }} -->
  </div>
</template>


<script>
export default {
  props: {
    param: String,
    min: Number,
    max: Number
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

  computed: {
    bottom() { return 'bottom:' + this.sliderValue + '%'; }
  },

  created() {
    const self = this;

    this.range = (this.max - this.min) / 100;
    this.id = this.$parent.id + '-' + this.param;

    // this.sliderValue = this.value;
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

    // fetch the slider's value from the Store parameterSet, update itself as well as the (parent) Component
    this.$bus.$on('parameters:load', this.fetchValue);
  },

  destroyed() {
    console.log('Destroying Slider ', this.id);
    this.$store.commit('REMOVE_PARAMETER', this.id);
    this.$bus.$off('parameters:load', this.fetchValue);
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
      // this.value = value;
      this.$emit('value', value);
      this.$store.commit('SET_PARAMETER', {
        id: this.id,
        value: value
      });
    },

    fetchValue() {
      console.log('%c • Slider (%s) value: %d', 'color: blue', this.param, this.value);
    }
  }
};

</script>


<style lang="scss">
  .slider {
    background: #444;
    border-radius: 4px;
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
