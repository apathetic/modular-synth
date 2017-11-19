
THE Knob allows the manipulation of a particular parameter. Internally, the
Knob's value can vary between zero and one (0 -> 1). This value is then
mapped to the min and max properties passed into the component, and $emit'd
back to the parent.

When init'd the Knob "registers" itself with the store, via REGISTER_PARAMETER.
Settings, updates, etc. are tracked this way i.e. all parameter changes
are automatically persisted to the vuex store.

Notes: the "param" property _must_ match the name of the data it represents
in the parent component. For example, Knob param="freq" implies that there
is a "freq" parameter in the parent Component.

<template>
  <svg class="knob" @mousedown.stop.prevent="start">
    <path ref="track" class="track" fill="none" stroke-width="8" d=""></path>
    <path ref="display" class="display" fill="none" stroke-width="8" :d="arc"></path>
    <!-- <path ref="computed" fill="none" stroke="#ebba00" stroke-width="3" d=""></path> -->
    <text x="24" y="28">{{ value.toFixed(decimals) }}</text>
    <text x="24" y="54">{{ param }}</text>
  </svg>
</template>


<script>
import { EVENT } from '../../events';

const SIZE = 20;
const X = 24; // half the css knob radius
const Y = 24;

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
    param: String,
    mode: {
      type: String,
      default: 'linear'
    },
    min: Number,
    max: Number,
    default: Number,
    decimals: 0
  },

  data() {
    return {
      active: false,
      startValue: 0,
      startY: null,
      internalValue: 0, // 0 -> 1 internally
      range: 1,
      value: 0
      // _temp: 0 // used to check if value was changed externally (ie via $store)
    };
  },

  computed: {
    /**
     * Helper function for the path attribute d in the svg display.
     * @return {string} The new path attribute.
     */
    arc: function() {
      const rotationValue = this.internalValue * 300 + 30;    // 30 -> 330. Dials start 30deg in and end 30deg before 360.
      return describeArc(X, Y, SIZE, 30, rotationValue);
    }

    // /**
    //  * Getter and setter functions for the value in the vuex $store.
    //  */
    // value: {
    //   get() {
    //     return this.$store.getters.parameters[this.id] || this.default || 0;
    //   },

    //   set(value) {
    //     this._temp = value;
    //     this.$emit('value', value); // update parent w/ value
    //     this.$store.commit('SET_PARAMETER', {
    //       id: this.id,
    //       value: value
    //     });
    //   }
    // }
  },

  // watch: {
  //   value: function(value) {
  //     if (!this._temp || value !== this._temp) { // value was changed externally ie. via $store
  //       this.$store.commit('REGISTER_PARAMETER', this.id); // in the event where the new parameterSet did not contain this param, let's register it
  //       this.internalValue = this.computeValue(value, true);
  //       console.log('%c[parameter] %s Knob set to %f', 'color: orange', this.param, value);
  //     }
  //   }
  // },

  created() {
    const self = this;

    this.id = this.$parent.id + '-' + this.param;
    this.range = this.max - this.min;

    this.$store.commit('REGISTER_PARAMETER', this.id);
    this.$emit('value', this.value); // update parent w/ value

    // TODO: avoid dupl w/ every knob? ie. one mouseup listener in the App, or: just add / remove dynamically as needed?
    this.mouseup = (e) => {
      window.mouseDown = false;
      self.active = false;

      document.body.style.webkitUserSelect = 'auto';
      document.body.style.userSelect = 'auto';
    };

    this.mousemove = (e) => {
      if (window.mouseDown && self.active) {
        self.update(e);
      }
    };

    window.addEventListener(EVENT.MOUSE_UP, this.mouseup);
    window.addEventListener(EVENT.MOUSE_MOVE, this.mousemove);

    this.$bus.$on(EVENT.PARAMETERS_LOAD, this.fetchValue);

    console.log('%c[parameter] Creating %s Knob', 'color: orange', this.param);
  },

  mounted() {
    this.internalValue = this.computeValue(this.value, true);
    this.$refs.track.setAttribute('d', describeArc(X, Y, SIZE, 30, 330)); // draw track
    // this.$refs.computed.setAttribute('d', describeArc(x, y, SIZE - 4, 30, 330));  // inner track. "actual" value, from varying inputs, etc.
  },

  destroyed() {
    this.$store.commit('REMOVE_PARAMETER', this.id);
    window.removeEventListener(EVENT.MOUSE_UP, this.mouseup);
    window.removeEventListener(EVENT.MOUSE_MOVE, this.mousemove);

    console.log('%c[parameter] Destroying Knob %s', 'color: grey', this.id);
  },

  methods: {
    /**
     * Set up calculations for updating new knob values.
     * @param {Event} e The mouse down Event.
     */
    start(e) {
      window.mouseDown = true;
      this.active = true;
      this.startValue = this.internalValue;
      this.startY = e.clientY;
    },

    /**
     * Updates new knob values on mouse move.
     * @param {Event} e The mouse move Event.
     */
    update(e) {
      const delta = (this.startY - e.clientY) / 100.0; // drag distance, 1/100th pixels
      const internalValue = Math.min(1, Math.max(0, this.startValue + delta));

      if (this.internalValue === internalValue) return;

      this.internalValue = internalValue;
      this.value = this.computeValue(internalValue);

      this.$emit('value', this.value); // update parent w/ value
      this.$store.commit('SET_PARAMETER', {
        id: this.id,
        value: this.value
      });
    },

    /**
     * Maps the interval knob value to the desired range. Linear or exponential.
     * @param {number}  n The value to map.
     * @param {boolean} extract If true, extracts the internalValue from value,
     *                          otherwise calculate value from internalValue.
     */
    computeValue(n, extract = false) {
      // console.log('extract', extract);
      if (extract) { // derive internalValue from value
        return parseFloat(this.mode === 'log'
          ? Math.log2((n + this.range - this.min) / this.range)
          : (n - this.min) / this.range
        );
      } else { // calculate value from internalValue
        return parseFloat(this.mode === 'log'
          ? this.range * Math.pow(2, n) - this.range + this.min
          : n * this.range + this.min
        );
      }
    },

    fetchValue() {
      /*
      NOTE: this is only necessary when the parameterSet does *not* contain values for
      all parameters. In essence, this function will update itself when the parameterSet
      is changed, to either the value in the $store (if it exists) or the default value.
      */
      this.value = this.$store.getters.parameters[this.id] || this.default || 0;
      this.internalValue = this.computeValue(this.value, true);

      console.log('%c[parameter] %s Knob set to %f', 'color: orange', this.param, this.value);
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
