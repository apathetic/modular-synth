<template>
  <button
    class="power"
    :class="power ? 'on' : 'off'"
    @click="togglePower"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path d="M28,18c0,6.629-5.375,12-12,12C9.371,30,4,24.629,4,18c0-5.223,3.34-9.652,8-11.301v4.41C9.617,12.496,8,15.047,8,18 c0,4.418,3.582,8,8,8s8-3.582,8-8c0-2.953-1.621-5.504-4-6.891v-4.41C24.656,8.348,28,12.777,28,18z M16,16c1.105,0,2-0.895,2-2V4 c0-1.104-0.895-2-2-2s-2,0.896-2,2v10C14,15.105,14.895,16,16,16z" />
    </svg>
  </button>
</template>


<script lang="ts">
  import { defineComponent, inject, computed, watch } from 'vue';
  import { useAppStore } from '@/stores/app';

  export default defineComponent({
    name: 'Power',
    setup() {
      const context = inject('context') as AudioContext;
      const store = useAppStore();
      const power = computed(() => store.power);

      watch(power, (on: boolean) => {
        if (on) {
          context.resume();
        }
        else {
          context.suspend();
        }
      });


      window.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Escape':
            // store.togglePower();
            break;
        }
      });


      return {
        power,
        togglePower: store.togglePower,
      };
    }
  });
</script>


<style>
  .power {
    color: var(--color-inactive);
    background: var(--color-grey-dark);
    box-shadow: inset 0 0.2em 0.6em rgba(0, 0, 0, 0.3);
    border-radius: 50%;;
  }

  .power svg {
    fill: currentColor;
    height: 100%;
    transition: all 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    top: -1.5px;
  }

  .power.on {
    color: var(--color-green);
  }

  .power.on::after {
    content: '';
    display: block;
    filter: blur(1px);
    border: 1px solid currentColor;
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
    border-radius: 50%;
  }

  .power.off:hover {
    color: var(--color-hover)
  }
</style>
