/**
 * Parameter.
 * This mixin provide base functionality for any Parameter.
 * @type {Object}
 */

import { EVENT } from '../events';

export const parameter = {
  props: {
    param: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      default: 'linear'
    },
    min: Number,
    max: Number
  },

  data() {
    return {
      active: false,
      startValue: 0,
      startY: null,
      internalValue: 0, // 0 -> 1 internally
      range: 1,
      value: 0
    };
  },

  created() {
    const self = this;

    this.id = this.$parent.id + '-' + this.param;
    this.range = this.max - this.min;
    this.$emit('value', this.value); // update parent w/ value
    // this.$emit('update:value', this.value); // update parent w/ value

    // this.$store.commit('REGISTER_PARAMETER', this.id);

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

  destroyed() {
    this.$store.commit('REMOVE_PARAMETER', this.id);
    this.$bus.$off(EVENT.PARAMETERS_LOAD, this.fetchValue);
    window.removeEventListener(EVENT.MOUSE_UP, this.mouseup);
    window.removeEventListener(EVENT.MOUSE_MOVE, this.mousemove);

    console.log('%c[parameter] Destroying %s %s', 'color: grey', this.type, this.id);
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
      if (extract) {
        return parseFloat(this.mode === 'log'
          ? Math.log2((n + this.range - this.min) / this.range)
          : (n - this.min) / this.range
        );
      } else {
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
      this.$emit('value', this.value);

      console.log('%c[parameter] %s %s set to %f', 'color: orange', this.param, this.type, this.value);
    }
  }
};
