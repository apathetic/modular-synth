
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
import { parameter } from '../../mixins/parameter';

const SIZE = 20;
const X = 24; // half the css knob radius
const Y = 24;

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees + 90) * Math.PI / 180.0;

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
  mixins: [parameter],

  props: {
    default: Number,
    decimals: 0
  },

  data() {
    return {
      type: 'Knob'
      // _temp: 0 // used to check if value was changed externally (ie via $store)
    };
  },

  computed: {
    /**
     * Helper function for the path attribute d in the svg display.
     * @return {string} The new path attribute.
     */
    arc() {
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

  mounted() {
    this.internalValue = this.computeValue(this.value, true);
    this.$refs.track.setAttribute('d', describeArc(X, Y, SIZE, 30, 330)); // draw track
    // this.$refs.computed.setAttribute('d', describeArc(x, y, SIZE - 4, 30, 330));  // inner track. "actual" value, from varying inputs, etc.
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
