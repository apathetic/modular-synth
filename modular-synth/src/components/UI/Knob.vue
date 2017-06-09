
THE Knob allows the manipulation of a particular parameter. Internally, the
Knob's value can vary between zero and one (0 -> 1). This value is then
mapped to the min and max properties passed into the component, and $emit'd
back to the parent.

When init'd the Knob "registers" itself with the store, via ADD_PARAMETER.
Settings, updates, etc. are tracked this way i.e. all parameter changes
are automatically persisted to the vuex store.

Notes: the "param" property _must_ match the name of the data it represents
in the parent component. For example, Knob param="freq" implies that there
is a "freq" parameter in the Component.

<template>
  <svg class="knob" @mousedown.stop.prevent="start">
    <path ref="track" class="track" fill="none" stroke-width="8" d=""></path>
    <path ref="display" class="display" fill="none" stroke-width="8" d=""></path>
    <!-- <path ref="computed" fill="none" stroke="#ebba00" stroke-width="3" d=""></path> -->
    <text x="24" y="28">{{ value.toFixed(this.decimals) }}</text>
    <text x="24" y="54">{{ param }}</text>
  </svg>
</template>


<script>
const size = 20;
const x = 24; // half the css knob size
const y = 24;

// let startValue = 0;
// let startY = 0;


function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  let angleInRadians = (angleInDegrees + 90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(x, y, radius, startAngle, endAngle) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

export default {
  props: {
    // label: String,
    param: String,
    min: Number,
    max: Number,
    decimals: 0
  },

  data() {
    return {
      active: false,
      startValue: 0,
      startY: null,
      knobValue: 0,         // 0 -> 1 internally
      range: 1,
      value: 0
    };
  },

  created() {
    const self = this;

    this.range = this.max - this.min;
    this.id = this.$parent.id + '-' + this.param;
    this.$store.commit('ADD_PARAMETER', this.id);

    // TODO: avoid dupl w/ every knob? ie. one mouseup listener in the App
    //       or: just add / remove dynamically as needed?
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

    // fetch the knob's value from the Store parameterSet, update itself as well as the (parent) Component
    this.$bus.$on('parameters:load', this.fetchValue);
  },

  mounted() {
    this.$refs.track.setAttribute('d', describeArc(x, y, size, 30, 330));  // draw track
    // this.$refs.computed.setAttribute('d', describeArc(x, y, size - 4, 30, 330));  // "actual" value, from varying inputs, etc.
    this.setDisplay();
  },

  destroyed() {
    console.log('Destroying Knob ', this.id);
    this.$store.commit('REMOVE_PARAMETER', this.id);
    this.$bus.$off('parameters:load', this.fetchValue);
  },

  methods: {
    start(e) {
      window.mouseDown = true;
      this.active = true;
      this.startValue = this.knobValue;
      this.startY = e.clientY;

      // document.body.style.webkitUserSelect = 'none';
      // document.body.style.userSelect = 'none';
    },

    update(e) {
      const delta = (this.startY - e.clientY) / 100.0;   // drag distance, 1/100th pixels
      const knobValue = Math.min(1, Math.max(0, this.startValue + delta));

      this.knobValue = knobValue;
      this.value = parseFloat(knobValue * this.range + this.min);

      this.$emit('value', this.value);
      this.setDisplay();

      this.$store.commit('SET_PARAMETER', {
        id: this.id,
        value: this.value
      });
    },

    setDisplay() {
      const rotationValue = this.knobValue * 300 + 30;    // 30 -> 330. Dials start 30deg in and end 30deg before 360.

      this.$refs.display.setAttribute('d', describeArc(x, y, size, 30, rotationValue));
    },

    fetchValue() {
      // TODO fix $refs(?) when changing paramSets
      if (!this.$refs.display) {
        console.warn('undefined knob: ', this.id);
        return;
      }

      this.value = this.$store.state.parameters[this.id] || 0;
      this.knobValue = this.value / this.range;               // derive internal knobValue from value
      this.$emit('value', this.value);                        // update parent w/ new value
      this.setDisplay();
    }

  }
};

</script>


<style lang="scss">
  @import '../../assets/scss/variables.scss';

  .knob {
    width: 48px;
    height: 64px;
    cursor: pointer;

    text {
      text-anchor: middle;
      font-size: 1rem;
      // fill: #fff;
    }

    .track {
      stroke: $color-grey-medium;
    }

    .display {
      stroke: $color-highlight;
    }
  }
</style>
