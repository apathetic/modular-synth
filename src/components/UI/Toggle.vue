<template>
  <div class="toggle-container" @click="toggle" :title="title">
    <svg class="toggle" viewBox="0 0 32 64">
      <!-- Background track -->
      <rect x="8" y="4" width="16" height="56" rx="8" class="track" />

      <!-- Switch handle -->
      <circle
        cx="16"
        :cy="handleY"
        r="10"
        class="handle"
      />
    </svg>
    <div class="label">{{ param }}</div>
    <div class="value">{{ currentOptionLabel }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watchEffect } from 'vue';
import { useParameter, useModuleId } from '~/composables';
import { useAppStore } from '~/stores/app';

export default defineComponent({
  name: 'Toggle',
  props: {
    param: {
      type: String,
      required: true
    },
    options: {
      type: Array<string>,
      default: () => ['Off', 'On']
    },
    title: {
      type: String,
      default: ''
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

    // Calculate Y position of handle.
    // top = 14 (index 0)
    // bottom = 50 (index max)
    const handleY = computed(() => {
      const top = 14;
      const bottom = 50;
      if (max === 0) return top;
      const ratio = currentIndex.value / max;
      return top + ratio * (bottom - top);
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
      toggle,
      handleY,
      currentOptionLabel
    };
  }
});
</script>

<style scoped>
.toggle-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  width: 48px;
}

.toggle {
  width: 32px;
  height: 64px;
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
  transition: cy 0.15s cubic-bezier(0.4, 0, 0.2, 1);
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
</style>
