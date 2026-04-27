<script lang="ts">
  import { defineComponent, computed, watchEffect } from 'vue';
  import { useParameter, useModuleId } from '~/composables';
  import { useAppStore } from '~/stores/app';
  import type { PropType } from 'vue';

  export default defineComponent({
    name: 'Toggle',
    props: {
      param: {
        type: String,
        required: true
      },
      options: {
        type: Array as PropType<string[]>,
        default: () => ['Off', 'On']
      },
      title: {
        type: String,
        default: ''
      },
      orientation: {
        type: String as PropType<'vertical' | 'horizontal'>,
        default: 'vertical'
      }
    },
    emits: ['value'],
    setup(props, { emit }) {
      const moduleId = useModuleId();
      const store = useAppStore();
      const min = 0;
      const max = Math.max(1, props.options.length - 1);

      const { mapped } = useParameter({
        moduleId,
        param: props.param,
        type: 'toggle',
        min,
        max
      });

      const currentIndex = computed(() => {
        let val = Math.round(mapped.value);
        if (isNaN(val)) val = 0;
        return Math.max(0, Math.min(val, props.options.length - 1));
      });

      const currentOptionLabel = computed(() => props.options[currentIndex.value]);

      // Calculate position of handle.
      // top/left = 16 (index 0)
      // bottom/right = 48 (index max)
      const handlePos = computed(() => {
        const start = 16;
        const end = 48;
        if (max === 0) return start;
        const ratio = currentIndex.value / max;
        return start + ratio * (end - start);
      });

      const toggle = () => {
        const next = (currentIndex.value + 1) % props.options.length;
        store.setParameter({ moduleId, param: props.param, value: next });
      };

      watchEffect(() => {
        emit('value', currentIndex.value);
      });

      return {
        param: props.param,
        title: props.title,
        orientation: props.orientation,
        toggle,
        handlePos,
        currentOptionLabel
      };
    }
  });
</script>


<template>
  <div
    class="toggle"
    :class="orientation"
    :title="title"
    @mousedown.stop="toggle"
  >
    <svg :viewBox="orientation === 'vertical' ? '0 0 32 64' : '0 0 64 32'">
      <!-- Background track -->
      <rect v-if="orientation === 'vertical'" x="4" y="4" width="24" height="56" rx="12" class="track" />
      <rect v-else x="4" y="4" width="56" height="24" rx="12" class="track" />

      <!-- Switch handle -->
      <circle v-if="orientation === 'vertical'" cx="16" :cy="handlePos" r="10" class="handle" />
      <circle v-else :cx="handlePos" cy="16" r="10" class="handle" />
    </svg>
    <div class="label">{{ param }}</div>
    <div class="value">{{ currentOptionLabel }}</div>
  </div>
</template>


<style>
  .toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    user-select: none;

    &.vertical {
      width: 48px;
      svg { width: 26px; height: 52px; }
    }

    &.horizontal {
       width: 64px;
       svg { width: 52px; height: 26px; }
    }

    .track {
      fill: #111;
      stroke: #333;
      stroke-width: 2;
    }

    .handle {
      fill: #bbb;
      stroke: #000;
      stroke-width: 1;
      transition: cx 0.15s cubic-bezier(0.4, 0, 0.2, 1), cy 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

  .label {
    font-size: 0.8rem;
    margin-top: 4px;
    color: #fff;
    text-align: center;
  }

  .value {
    font-size: 0.7rem;
    color: var(--color-highlight, #fca311);
    text-align: center;
  }
  }
</style>
