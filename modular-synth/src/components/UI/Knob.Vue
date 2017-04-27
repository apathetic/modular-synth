
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
    <path ref="computed" fill="none" stroke="#ebba00" stroke-width="3" d=""></path>
    <text x="24" y="28">{{ value }} {{ _value }}</text>
    <text x="24" y="54">{{ param }}</text>
  </svg>
</template>


<script>
const size = 20;
const x = 24; // half the css knob size
const y = 24;

// let startValue = 0;
// let startClientY = 0;


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

  computed: {
    _value() {
      return this.$store.state.parameters[this.id] || 0;
    }
  },

  data() {
    return {
      active: false,
      startValue: 0,
      startClientY: null,
      knobValue: 0,         // 0 -> 1 internally
      range: 1,
      value: 0
    };
  },

  created() {
    this.id = this.$parent.id + '-' + this.param;
    this.$store.commit('ADD_PARAMETER', this.id);


    const self = this;

    this.range = this.max - this.min;
    // this.knobValue = 100 * (this.value - this.min) / (this.max - this.min);  // derive internal knobValue from value

    // TODO: avoid dupl w/ every knob? ie. one mouseup listener in the App
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

  mounted() {
    this.$refs.track.setAttribute('d', describeArc(x, y, size, 30, 330));
    // document.getElementById('computed').setAttribute('d', describeArc(x, y, size-14, 30, end));

    this.setDisplay();
  },

  destroyed() {
    this.$store.commit('REMOVE_PARAMETER', this.id);
  },

  methods: {
    start(e) {
      window.mouseDown = true;
      this.active = true;
      this.startValue = this.knobValue;
      this.startClientY = e.clientY;

      // document.body.style.webkitUserSelect = 'none';
      // document.body.style.userSelect = 'none';
    },

    update(e) {
      const delta = (this.startClientY - e.clientY) / 100.0;   // drag distance, 1/100th pixels
      const knobValue = Math.min(1, Math.max(0, this.startValue + delta));
      const value = knobValue * this.range + this.min;

      this.knobValue = knobValue;
      this.value = parseFloat(value).toFixed(this.decimals);

      this.$emit('value', value);
      this.setDisplay();

      this.$store.commit('SET_PARAMETER', {
        id: this.id,
        value
      });
    },

    setDisplay() {
      const rotationValue = this.knobValue * 300 + 30;    // 30 -> 330. Dials start 30deg in and end 30deg before 360.

      this.$refs.display.setAttribute('d', describeArc(x, y, size, 30, rotationValue));
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
