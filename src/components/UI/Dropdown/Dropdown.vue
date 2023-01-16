<template>
  <ul
    class="dropdown"
    :class="active ? 'active' : ''"
    @mousedown.stop="open"
  >
    <li
      v-for="(option, index) in options"
      :class="index == selected ? 'active' : ''"
      :key="index"
      @mouseup="select(index)"
    >
      {{ option }}
    </li>
  </ul>
</template>


<script>
  import { watchEffect } from 'vue';
  import { useAppStore } from '@/stores/app';
  // import { parameter } from '../../mixins/parameter';
  import { EVENT } from '@/events';


  export default {
    name: 'ui-dropdown',
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
      const store = useAppStore();
      // const { parameters } = storeToRefs(store);

      this.id = this.$parent.id + '-' + this.param;
      this.$emit('value', this.options[0]); // update parent w/ value

      // this.$bus.$on(EVENT.PARAMETERS_LOAD, this.syncValue);
      watchEffect(() => {
        // const value = parameters[this.id] || this.options[0];
        const value = store.parameters[this.id] || this.options[0];

        this.$emit('value', value);
        this.selected = this.options.indexOf(value);

        console.log('%c[parameter] %s %s set to %s', 'color: orange', this.param, this.type, value);
      });


      // TODO integrate w/ parameter.js
      console.log('%c[parameter] Creating %s Dropdown', 'color: lightblue', this.param);
    },

    unmounted() {
      // this.$store.commit('REMOVE_PARAMETER', this.id);
      // this.$bus.$off(EVENT.PARAMETERS_LOAD, this.syncValue);
      const store = useAppStore();
      store.removeParameter(this.id);

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
      syncValue() {
        const value = this.$store.getters.parameters[this.id] || this.options[0];

        this.$emit('value', value);
        this.selected = this.options.indexOf(value);

        console.log('%c[parameter] %s %s set to %s', 'color: orange', this.param, this.type, value);
      }
    }

  };
</script>


<style lang="scss">
  .dropdown {
    list-style: none;
    width: 7em;

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
        color: var(--color-hover);
      }
    }
  }

</style>
