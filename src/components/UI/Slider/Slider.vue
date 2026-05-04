<script lang="ts">
  import { defineComponent, computed, watchEffect, watch } from 'vue';
  import { useParameter, useModuleId } from '~/composables';

  export default defineComponent({
    name: 'Slider',

    props: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 1 },
      param: { // ie. name
        type: String,
        required: true
      },
      variant: {
        type: String,
        default: ''
      },
      label: {
        type: String,
        default: ''
      }
    },

    emits: ['value'],

    setup (props, { emit }) {
      const { param, min, max } = props; // don't care about reactivitiy here
      const type = 'slider';
      const moduleId = useModuleId();
      const { start, mapped, normalized } = useParameter({ moduleId, param, type, min, max });

      // for the component
      watchEffect(() => {
        emit('value', mapped.value);
      });

      // const value = computed(() => {
      //   return parseFloat(mapped.value).toFixed(precision.value);
      // });

      const zero = computed(() => {
        return (min < 0) ? (0 - min) / (max - min) : 0;
      });

      const styles = computed(() => {
        const norm = normalized.value;
        const z = zero.value;
        return {
          fill: {
            bottom: Math.min(norm, z) * 100 + '%',
            height: Math.abs(norm - z) * 100 + '%'
          },
          indicator: {
            bottom: norm * 100 + '%'
          }
        };
      });

      return {
        start,
        styles,
      }

    }
  });
</script>


<template>
  <div
    class="slider"
    :class="[variant]"
  >
    <div
      class="slider-track"
      @mousedown.stop.prevent="start"
    >
      <div class="fill" :style="styles.fill"></div>
      <div class="indicator" :style="styles.indicator"></div>
    </div>
    <label v-if="label" class="label">{{ label }}</label>
  </div>
</template>


<style>
  .slider {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;

    .slider-track {
      background: #333;
      height: 48px;
      width: 12px;
      cursor: ns-resize;
      overflow: hidden;
      position: relative;

      .fill {
        opacity: 0.6;
        background-color: var(--color-highlight);
        position: absolute;
        width: 100%;
        left: 0;
        bottom: 0;
      }

      .indicator {
        position: absolute;
        width: 100%;
        height: 1px;
        background-color: var(--color-highlight);
        left: 0;
        pointer-events: none;
      }
    }

    &.thin {
      .slider-track {
        border-radius: 4px;
        width: 8px;
      }
    }

    &.large {
      .slider-track {
        height: 120px;
        width: 24px;
      }
    }

  }
</style>
