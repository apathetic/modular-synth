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
  import { defineComponent, ref, watchEffect, onUnmounted } from 'vue';
  import { useAppStore } from '@/stores/app';
  import { useModuleId } from '@/composables';
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

      const moduleId = useModuleId();
      const str = `${type} ${moduleId}.${param}`;
      log({ type:'parameter', action:'creating', data: str });

      emit('value', options[0]); // update parent w/ value

      watchEffect(() => {
        const value = store.getParameter(moduleId, param) ?? options[0];

        emit('value', value);
        selected.value = options.indexOf(value);

        log({ type:'parameter', action:'setting', data:`${str} to ${value}` });
      });

      onUnmounted(() => {
        store.removeParameter({ moduleId, param });
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

        store.setParameter({ moduleId, param, value });
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
