<template>
  <ul class="dropdown"
      :class="active ? 'active' : ''"
      @mousedown.stop="open">
    <li v-for="(option, index) in options"
        @mouseup="select(index)"
        :class="index == selected ? 'active' : ''">
      {{ option }}
     </li>
  </ul>
</template>


<script>
// import { parameter } from '../../mixins/parameter';
import { EVENT } from '../../events';

export default {
  // mixins: [parameter],

  props: {
    options: Array
  },

  data() {
    return {
      active: false,
      selected: 1,
      type: 'dropdown'
    };
  },

  created() {
    this.id = this.$parent.id + '-' + this.param;
    this.$emit('value', this.value); // update parent w/ value
    this.$bus.$on(EVENT.PARAMETERS_LOAD, this.fetchValue);

    console.log('%c[parameter] Creating %s Knob', 'color: orange', this.param);
  },

  destroyed() {
    this.$store.commit('REMOVE_PARAMETER', this.id);
    this.$bus.$off(EVENT.PARAMETERS_LOAD, this.fetchValue);

    console.log('%c[parameter] Destroying %s %s', 'color: grey', this.type, this.id);
  },

  methods: {
    open() {
      this.active = true;

      this.dismiss = () => {
        this.active = false;
        window.removeEventListener('mouseup', this.dismiss);
      };

      window.addEventListener('mouseup', this.dismiss);
    },

    select(index) {
      console.log(index);
      this.selected = index;
      this.value = this.options[index];

      this.$emit('value', this.value); // update parent w/ value
      this.$store.commit('SET_PARAMETER', {
        id: this.id,
        value: this.value
      });
    },

    // TODO duplication w/ mixins/Parameter.js
    fetchValue() {
      this.value = this.$store.getters.parameters[this.id] || this.options[0];
      this.$emit('value', this.value);

      console.log('%c[parameter] %s %s set to %f', 'color: orange', this.param, this.type, this.value);
    }
  }

};

</script>


<style lang="scss">
  // @import '@/assets/scss/variables.scss';
  @import '../../assets/scss/variables.scss';

  .dropdown {
    list-style: none;
    width: 10em;

    &.active li {
      display: block;

      &.active {
        &::after {
          content: '✓'
        }
      }
    }

    li {
      &:not(.active) { display: none; }
      &:hover {
        cursor: pointer;
        color: $color-hover;
      }
    }
  }

</style>
