<!--
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
-->

<template>
  <svg class="knob" @mousedown.stop.prevent="start">
    <path :d="track" class="track" fill="none" stroke-width="8"></path>
    <path :d="arc" class="display" fill="none" stroke-width="8"></path>
    <text x="24" y="28">{{ parseFloat(mapped).toFixed(precision) }}</text>
    <text x="24" y="54">{{ param }}</text>
  </svg>
</template>


<script>
  import { defineComponent, computed, watchEffect, ref, onMounted } from 'vue';
  import { getCurrentInstance } from 'vue';
  import { useParameter } from '@/composables';

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


  export default defineComponent({
    name: 'Knob',

    props: {
      default: Number,
      precision: 0,
      min: 0,
      max: 1,
      param: { // ie. name
        type: String,
        required: true
      },
      mode: {
        type: String,
        default: 'linear'
      },
    },

    emits: ['value'],

    setup (props, { emit }) {
      const { param, min, max, mode } = props;
      const instance = getCurrentInstance(); // gets the current component and its application context
      const parentId = instance.parent.ctx.id;
      const id = `${parentId}-${param}`; // ie 11-detune or 11-freq or 5-mod
      const type = 'knob';

      const { start, mapped, normalized } = useParameter({ id, type, min, max, mode });
      const track = ref('');
      const arc = ref('');

      // for the component
      watchEffect(() => {
        emit('value', mapped.value);
      });

      // for the UI
      watchEffect(() => {
        // 30 -> 330. Dials start 30deg in and end 30deg before 360.
        const rotationValue = normalized.value * 300 + 30;
        arc.value = describeArc(X, Y, SIZE, 30, rotationValue);
      });

      onMounted(() => {
        track.value = describeArc(X, Y, SIZE, 30, 330); // draw track
      });


      return {
        param,
        track,
        arc,
        start, mapped,
      }

      // data() {
      //   return {
      //     type: 'Knob'
      //   };
      // },
      // computed: {
      //   arc: { ...
      //   value: {
      //     get() {
      //       return this.$store.getters.parameters[this.id] || this.default || 0;
      //     },
      //     set(value) {
      //       this._temp = value;
      //       this.$emit('value', value); // update parent w/ value
      //       this.$store.commit('SET_PARAMETER', {
      //         id: this.id,
      //         value: value
      //       });
      //     }
      //   }
      // },
      // watch: {
      //   value: function(value) {
      //     if (!this._temp || value !== this._temp) {            // value was changed externally ie. via $store
      //       this.$store.commit('REGISTER_PARAMETER', this.id);  // if parameterSet didnt contain this param, register it
      //       normalized.value = this.computeValue(value, true);
      //       console.log('%c[parameter] %s Knob set to %f', 'color: orange', this.param, value);
      //     }
      //   }
      // },

    }
  });
</script>


<style lang="scss">
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
      stroke: var(--color-grey-medium);
    }

    .display {
      stroke: var(--color-highlight);
    }
  }
</style>
