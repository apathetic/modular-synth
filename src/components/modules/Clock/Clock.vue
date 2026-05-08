<script lang="ts">
  import { defineComponent, ref, watch, onMounted, onUnmounted, computed } from 'vue';
  import { useAppStore } from '~/stores/app';
  import { Clock, type ClockDivision } from '~/audio/modules/clock';

  function useStoreParam<T>(moduleId: number, name: string, fallback: T) {
    const store = useAppStore();
    return computed<T>({
      get: () => (store.getParameter(moduleId, name) as T) ?? fallback,
      set: (value) => store.setParameter({ moduleId, param: name, value: value as any })
    });
  }

  /*
    Thin UI shell around `Clock`. Owns the refs that back the two data
    outlets (`gate`, `reset`); routing.ts picks them up via `$watch` on the
    component instance, which works on setup-exposed refs the same way it
    does for NoteIn.
  */
  export default defineComponent({
    name: 'Clock',

    props: {
      id: {
        default: undefined,
        required: true,
      },
    },

    setup(_props, { expose }) {
      const divisions: ClockDivision[] = ['4n', '8n', '16n', '32n'];
      const divisionTicks = computed(() => parseInt(division.value, 10));
      const divisionLabel = computed(() => ({ '4n':'4th', '8n':'8th', '16n':'16th', '32n':'32nd' }[division.value]));

      const moduleId = _props.id as unknown as number;

      const gate       = ref<0 | 1>(0);
      const reset      = ref<0 | 1>(0);
      const running    = ref(false);

      const bpm        = useStoreParam<number>(moduleId, 'bpm', 120);
      const division   = useStoreParam<ClockDivision>(moduleId, 'division', '16n');
      const shuffle    = useStoreParam<number>(moduleId, 'shuffle', 0);
      const resetEvery = ref(64);
      const tickCount  = ref(0);

      const clock = new Clock({
        bpm:        bpm.value,
        division:   division.value,
        shuffle:    shuffle.value,
        resetEvery: resetEvery.value,
        onGate: (v) => {
          gate.value = v;
          if (v === 1) tickCount.value++;
        },
        onReset: () => {
          reset.value = 1;
          tickCount.value = 0;
          setTimeout(() => { reset.value = 0; }, 5);
        },
      });

      const outlets = [
        { label: 'gate',  data: 'gate'  },
        { label: 'reset', data: 'reset' },
      ];

      // UI changes: update clock
      watch(bpm,        (v) => { clock.bpm        = v; });
      watch(division,   (v) => { clock.division   = v; });
      watch(shuffle,    (v) => { clock.shuffle    = v; });
      watch(resetEvery, (v) => { clock.resetEvery = v; });

      function handleKeydown(e: KeyboardEvent) {
        if (e.code === 'Space') {
          // const target = e.target as HTMLElement;
          // if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
          //   return;
          // }
          e.preventDefault();
          toggleRun();
        }
      }

      onMounted(() => {
        window.addEventListener('keydown', handleKeydown);
      });

      onUnmounted(() => {
        window.removeEventListener('keydown', handleKeydown);
        clock.destroy();
      });

      expose({
        outlets,
      });



      function toggleRun() {
        if (running.value) {
          clock.stop();
          running.value = false;
        } else {
          clock.start();
          running.value = true;
        }
      }

      function manualReset() {
        clock.reset();
      }

      function cycleDivision() {
        const idx = divisions.indexOf(division.value);
        division.value = divisions[(idx + 1) % divisions.length];
      }

      function registerDrag(onMove: (e: PointerEvent) => void) {
        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      }

      function onBpmDrag(e: PointerEvent) {
        const startY = e.clientY;
        const startBpm = bpm.value;

        registerDrag((me: PointerEvent) => {
          const delta = startY - me.clientY;
          const step = me.shiftKey ? 0.1 : 1;
          bpm.value = Math.max(20, Math.min(300, Math.round((startBpm + delta * step) * 10) / 10));
        });
      }

      function onShuffleDrag(e: PointerEvent) {
        const startY = e.clientY;
        const startShuffle = shuffle.value;

        registerDrag((me: PointerEvent) => {
          const delta = startY - me.clientY;
          const step = me.shiftKey ? 0.001 : 0.01;
          shuffle.value = Math.max(0, Math.min(0.5, startShuffle + delta * step));
        });
      }

      return {
        outlets,
        divisions,

        gate,
        reset,
        running,
        tickCount,

        bpm,
        division,
        shuffle,
        resetEvery,

        divisionTicks,
        divisionLabel,

        toggleRun,
        manualReset,
        cycleDivision,
        onBpmDrag,
        onShuffleDrag,
      };
    },
  });
</script>


<template>
  <div class="clock">
    <div class="module-details">
      <h3>Clock</h3>
    </div>

    <div class="module-interface">
      <div class="name-bar">CLOCK <button>mod</button></div>

      <button class="transport" type="button" :class="{ running }" @pointerdown.stop.prevent="toggleRun">
        <svg viewBox="0 0 100 100">
          <polygon points="10,0 100,50 10,100" fill="currentColor" />
        </svg>
      </button>

      <div class="bpm" @pointerdown.stop.prevent="onBpmDrag">
        <label class="label">BPM</label>
        <div class="value">{{ bpm.toFixed(1) }}</div>
      </div>

      <div class="shuffle" @pointerdown.stop.prevent="onShuffleDrag">
        <label class="label">SHUFFLE</label>
        <div class="value">{{ Math.round(shuffle * 100) }}%</div>
      </div>

      <div class="gate">
        <label class="label">GATE</label>
        <div class="ring" @pointerdown.stop.prevent="cycleDivision">
          <svg viewBox="0 0 100 100">
            <circle
              v-for="i in divisionTicks"
              :key="i"
              cx="50" cy="4" r="3"
              :transform="`rotate(${(i - 1) * (360 / divisionTicks)} 50 50)`"
              :fill="(tickCount % divisionTicks) === (i - 1) ? 'var(--color-highlight)' : 'rgba(0, 229, 255, 0.2)'"
            />
          </svg>
          <div class="ring-text">{{ divisionLabel }}</div>
        </div>
      </div>
    </div>

    <div class="module-connections">
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .clock {
    background: linear-gradient(to bottom, #2f2e2b 0%, #262522 98%, #1a1917 100%);
    color: #fff;

    button.transport {
      position: absolute;
      top: 48px;
      left: 2px;
      width: 48px;
      height: 48px;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.2);
      cursor: pointer;
      padding: 0;
    }

    button.transport.running {
      color: var(--color-highlight);
    }

    button.transport svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .bpm {
      position: absolute;
      top: 120px;
      left: 5px;
    }

    .shuffle {
      position: absolute;
      top: 170px;
      left: 5px;
    }

    .gate {
      position: absolute;
      top: 60px;
      right: 10px;
      text-align: center;
    }

    .bpm, .shuffle, .gate {
      user-select: none;
    }

    .bpm .value, .shuffle .value {
      font-size: 2.2rem;
      font-weight: 600;
      color: var(--color-highlight);
      cursor: ns-resize;
      line-height: 1;
      /* letter-spacing: -0.02em; */
    }

    .ring {
      position: relative;
      width: 48px;
      height: 48px;
      cursor: pointer;
    }

    .ring svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }

    .ring-text {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-highlight);
    }
  }
</style>
