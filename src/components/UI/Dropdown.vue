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
    param: {
      type: String,
      required: false
    },
    options: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      active: false,
      selected: 1,
      type: 'Dropdown'
    };
  },

  created() {
    this.id = this.$parent.id + '-' + this.param;
    this.$emit('value', this.options[0]); // update parent w/ value
    this.$bus.$on(EVENT.PARAMETERS_LOAD, this.fetchValue);

    console.log('%c[parameter] Creating %s Dropdown', 'color: orange', this.param);
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
      const value = this.options[index];

      this.selected = index;
      this.$emit('value', value); // update parent w/ value
      this.$store.commit('SET_PARAMETER', {
        id: this.id,
        value: value
      });
    },

    // TODO duplication w/ mixins/Parameter.js
    fetchValue() {
      const value = this.$store.getters.parameters[this.id] || this.options[0];

      this.$emit('value', value);
      this.selected = this.options.indexOf(value);

      console.log('%c[parameter] %s %s set to %s', 'color: orange', this.param, this.type, value);
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

    &:not(.active) li {
      display: none;
    }

    &.active li {
      display: block;

      &.active::after {
        content: '✓';
      }
    }

    li {
      &.active {
        display: block;
      }

      &:hover {
        cursor: pointer;
        color: $color-hover;
      }
    }
  }

</style>
