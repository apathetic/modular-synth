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


<script lang="ts">
  import { defineComponent, ref, watchEffect, getCurrentInstance, onUnmounted } from 'vue';
  import { useAppStore } from '@/stores/app';
  // import { useParameter } from '@/composables';
  import { log } from '@/utils/logger';

  export default defineComponent({
    name: 'Dropdown',

    props: {
      param: {
        type: String,
        required: true
      },
      options: {
        type: Array,
        required: true
      }
    },

    emits: ['value'],

    setup(props, { emit }) {
      const { param, options } = props;
      const active = ref(false);
      const selected = ref(1);
      const type = 'Dropdown';
      const store = useAppStore();
      // const { parameters } = storeToRefs(store);

      // TODO integrate w/ parameter.js
      // console.log('%c[parameter] Creating %s Dropdown', 'color: teal', param);
      const str = `${type} (...)`;
      log({ type:'parameter', action:'creating', data: str });

      const instance = getCurrentInstance(); // gets the current component and its application context
      const parentId = instance.parent.ctx.id;
      const id = `${parentId}-${param}`; // ie 11-detune or 11-freq or 5-mod

      emit('value', options[0]); // update parent w/ value

      watchEffect(() => {
        const value = store.parameters[id] || options[0];

        emit('value', value);
        selected.value = options.indexOf(value);

        log({ type:'parameter', action:'setting', data:`${str} to ${value}` });
      });

      onUnmounted(() => {
        store.removeParameter(id);
        log({ type:'parameter', action:'destroying', data:str });
      });

      function open() {
        active.value = true;

        const dismiss = () => {
          active.value = false;
          window.removeEventListener('mouseup', dismiss);
        };

        window.addEventListener('mouseup', dismiss);
      }

      function select(index) {
        const value = options[index];

        // selected = index;
        // emit('value', value);
        store.setParameter({ id, value });
      }

      return {
        open,
        select,
        selected,
        active,
        options,
      }
    }
  });
</script>


<style lang="scss">
  .dropdown {
    list-style: none;
    width: 7em;
    z-index: 100;

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
