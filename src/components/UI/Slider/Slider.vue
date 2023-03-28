<template>
  <div class="slider" @mousedown.stop.prevent="start">
    <div class="fill" :style="amount"></div>
    <!-- {{ value }} -->
  </div>
</template>


<script lang="ts">
  import { defineComponent, computed, ref, watchEffect } from 'vue';
  import { getCurrentInstance } from 'vue';
  import { useParameter } from '@/composables';

  export default defineComponent({
    name: 'Slider',

    props: {
      min: 0,
      max: 1,
      param: { // ie. name
        type: String,
        required: true
      },
    },

    emits: ['value'],

    setup (props, { emit }) {
      const { param, min, max } = props;
      const instance = getCurrentInstance(); // gets the current component and its application context
      const parentId = instance.parent.ctx.id;
      const id = `${parentId}-${param}`; // ie 11-detune or 11-freq or 5-mod
      const type = 'slider';

      const { start, mapped, normalized } = useParameter({ id, type, min, max });
      const amount = ref('');

      // for the component
      watchEffect(() => {
        emit('value', mapped.value);
      });

      // for the UI
      watchEffect(() => {
        amount.value = 'bottom:' + normalized.value * 100 + '%';
      });

      return {
        start,
        amount
      }

    }
  });
</script>


<style lang="scss">
  .slider {
    background: #444;
    border-radius: 4px;
    height: 48px;
    width: 10px;
    cursor: ns-resize;
    overflow: hidden;

    .fill {
      opacity: 0.38;
      background-color: rgb(213, 45, 255);
      position: absolute;
      height: 100%;
      width: 100%;
      transform: translateY(100%);
    }
  }
</style>
