<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted, computed } from 'vue';
  import { useAppStore } from '~/stores/app';
  import { MASTER_ID } from '~/audio/master';
  import { gain, filter, delay } from '~/audio';

  const divisions = [
    { label: '1', factor: 4 },
    { label: '1/2', factor: 2 },
    { label: '1/4', factor: 1 },
    { label: '1/8', factor: 0.5 },
    { label: '1/16', factor: 0.25 },
    { label: '1/32', factor: 0.125 }
  ];

  function useStoreParam<T>(moduleId: number, name: string, fallback: T) {
    const store = useAppStore();
    return computed<T>({
      get: () => (store.getParameter(moduleId, name) as T) ?? fallback,
      set: (value) => store.setParameter({ moduleId, param: name, value: value as any })
    });
  }

  export default defineComponent({
    name: 'Delay',
    props: {
      id: {
        default: undefined,
        required: true
      }
    },
    setup (props, { expose }) {
      const moduleId = props.id as number;

      // Audio Nodes
      const inL = gain();
      const inR = gain();
      const outL = gain();
      const outR = gain();
      const dummyMod = gain();

      const dryL = gain(0.5);
      const dryR = gain(0.5);
      const wetL = gain(0.5);
      const wetR = gain(0.5);

      const delayL = delay(0.1, 5);
      const delayR = delay(0.1, 5);

      const hpfL = filter('highpass', 20);
      const lpfL = filter('lowpass', 20000);
      const hpfR = filter('highpass', 20);
      const lpfR = filter('lowpass', 20000);

      const feedbackL = gain(0.45);
      const feedbackR = gain(0.45);

      // Routing (Ping-Pong)
      inL.connect(dryL);
      inR.connect(dryR);

      inL.connect(delayL);
      inR.connect(delayR);

      // Left Path
      delayL.connect(hpfL);
      hpfL.connect(lpfL);
      lpfL.connect(feedbackL);
      lpfL.connect(wetL);

      // Right Path
      delayR.connect(hpfR);
      hpfR.connect(lpfR);
      lpfR.connect(feedbackR);
      lpfR.connect(wetR);

      // Modulation
      dummyMod.connect(delayL.delayTime);
      dummyMod.connect(delayR.delayTime);

      // Outputs
      dryL.connect(outL);
      wetL.connect(outL);
      dryR.connect(outR);
      wetR.connect(outR);

      // State
      const timeMs = useStoreParam(moduleId, 'timeMs', 100);
      const divisionIdx = useStoreParam(moduleId, 'divisionIdx', 2); // default 1/4
      const isSync = useStoreParam(moduleId, 'isSync', 0); // 0 or 1
      const syncSource = useStoreParam(moduleId, 'syncSource', 0); // 0: INT, 1: EXT
      const isPong = useStoreParam(moduleId, 'isPong', 1); // 0 or 1

      const mix = useStoreParam(moduleId, 'mix', 0.5);
      const feedback = useStoreParam(moduleId, 'feedback', 0.45);
      const hpfFreq = useStoreParam(moduleId, 'hpf', 20);
      const lpfFreq = useStoreParam(moduleId, 'lpf', 20000);

      const globalBpm = useStoreParam(MASTER_ID, 'bpm', 120);

      // Interval measuring
      const lastGateTime = ref(0);
      const measuredInterval = ref(500); // default to 500ms

      const handleGate = (val: number) => {
        if (val === 1) {
          const now = performance.now();
          if (lastGateTime.value > 0) {
            const diff = now - lastGateTime.value;
            // Limit interval to something reasonable (e.g. 50ms to 5000ms)
            if (diff > 50 && diff < 5000) {
              measuredInterval.value = diff;
            }
          }
          lastGateTime.value = now;
        }
      };

      const inlets = [
        { label: 'In L', audio: inL },
        { label: 'In R', audio: inR },
        { label: 'Gate', data: handleGate },
        { label: 'Mod', audio: dummyMod, desc: 'Reserved for future assignable modulation' }
      ];

      const outlets = [
        { label: 'Out L', audio: outL },
        { label: 'Out R', audio: outR }
      ];

      // Actual Delay Time Calculation
      const computedDelayTime = computed(() => {
        if (isSync.value === 0) {
          return timeMs.value / 1000.0;
        }

        const factor = divisions[divisionIdx.value].factor;
        let baseIntervalMs = 500;

        if (syncSource.value === 0) {
          // INT: 1 quarter note = 60000 / BPM ms
          baseIntervalMs = 60000 / globalBpm.value;
        } else {
          // EXT: measured interval from Gate input
          baseIntervalMs = measuredInterval.value;
        }

        return (baseIntervalMs * factor) / 1000.0;
      });

      // Watchers for Audio Nodes
      watch(computedDelayTime, (v) => {
        const t = inL.context.currentTime + 0.05;
        delayL.delayTime.linearRampToValueAtTime(v, t);
        delayR.delayTime.linearRampToValueAtTime(v, t);
      }, { immediate: true });

      watch(isPong, (v) => {
        try { feedbackL.disconnect(); } catch (e) {}
        try { feedbackR.disconnect(); } catch (e) {}

        if (v === 1) {
          feedbackL.connect(delayR);
          feedbackR.connect(delayL);
        } else {
          feedbackL.connect(delayL);
          feedbackR.connect(delayR);
        }
      }, { immediate: true });

      watch(mix, (v) => {
        // Equal power crossfade
        const w = Math.sin(v * 0.5 * Math.PI);
        const d = Math.cos(v * 0.5 * Math.PI);
        wetL.gain.value = w;
        wetR.gain.value = w;
        dryL.gain.value = d;
        dryR.gain.value = d;
      }, { immediate: true });

      watch(feedback, (v) => { feedbackL.gain.value = v; feedbackR.gain.value = v; }, { immediate: true });
      watch(hpfFreq, (v) => { hpfL.frequency.value = v; hpfR.frequency.value = v; }, { immediate: true });
      watch(lpfFreq, (v) => { lpfL.frequency.value = v; lpfR.frequency.value = v; }, { immediate: true });


      // TODO DRY this up w/ numberic input in Clock
      function registerDrag(onMove: (e: PointerEvent) => void) {
        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      }

      function onTimeDrag(e: PointerEvent) {
        const startY = e.clientY;

        if (isSync.value === 0) {
          const startMs = timeMs.value;
          registerDrag((me: PointerEvent) => {
            const delta = startY - me.clientY;
            const step = me.shiftKey ? 1 : 10;
            timeMs.value = Math.max(20, Math.min(5000, Math.round(startMs + delta * step)));
          });
        } else {
          const startIdx = divisionIdx.value;
          registerDrag((me: PointerEvent) => {
            const delta = startY - me.clientY;
            const shift = Math.floor(delta / 20); // 1 tick per 20px
            divisionIdx.value = Math.max(0, Math.min(divisions.length - 1, startIdx + shift));
          });
        }
      }

      expose({ inlets, outlets });

      return {
        inlets,
        outlets,
        timeMs,
        divisionIdx,
        isSync,
        syncSource,
        isPong,
        mix,
        feedback,
        hpfFreq,
        lpfFreq,
        divisions,
        onTimeDrag
      };
    }
  });
</script>


<template>
  <div class="delay">
    <div class="module-details">
      <h3>Pong Delay</h3>
    </div>

    <div class="module-interface">
      <div class="name-bar">DELAY <button>mod</button></div>

      <Button class="pong" :active="isPong === 1" @mousedown.stop="isPong = isPong === 1 ? 0 : 1">
        PONG
      </Button>
      <Button class="ms-th" :active="isSync === 1" @mousedown.stop="isSync = isSync === 1 ? 0 : 1">
        {{ isSync === 1 ? 'th' : 'ms' }}
      </Button>

      <div class="time" @pointerdown.stop.prevent="onTimeDrag">
        <div class="value" v-if="isSync === 0">{{ Math.round(timeMs) }}</div>
        <div class="value" v-else>{{ divisions[divisionIdx].label }}</div>
      </div>

      <div class="sync" v-if="isSync === 1">
        <span class="label">SYNC</span>
        <button @mousedown.stop="syncSource = syncSource === 1 ? 0 : 1">{{ syncSource === 0 ? 'INT' : 'EXT' }}</button>
      </div>


      <Knob param="feedback" @value="feedback = $event" :min="0" :max="0.9" :precision="2" class="feedback" variant="skirted" size="medium"></Knob>
      <Knob param="hpf" @value="hpfFreq = $event" :min="20" :max="20000" mode="log" class="hpf" variant="pointer" />
      <Knob param="lpf" @value="lpfFreq = $event" :min="20" :max="20000" mode="log"class="lpf" variant="pointer" />

      <Slider param="mix" label="MIX" variant="large thin" @value="mix = $event" :min="0" :max="1" class="mix" />
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id" />
      <Outlets :ports="outlets" :id="id" />
    </div>
  </div>
</template>

<style>
  .delay {
    .name-bar {
      color: rgb(140, 125, 149);
    }

    .module-interface {
      background: linear-gradient(to bottom, #efe5d3 0%, #c8bea9 98%, #8e8672 100%);
      color: rgb(140, 125, 149);

      .label { color: black; }

      & > * { position: absolute; }

      .time {
        text-align: center;
        user-select: none;
        top: 64px;
        left: 20px;
        width: 64px;
      }
      .time .value {
        font-size: 2.5rem;
        cursor: ns-resize;
        text-align: right;
        line-height: 1;
      }

      .pong { top: 40px; left: 10px; }
      .ms-th { top: 65px; right: 60px;     background: none;
    font-size: 1.2rem;
    font-weight: 300;
    border: 1px solid currentColor;}

      /* TODO DRY up with "priority button in note IN  */
      .sync {
        top: 65px;
        right: 32px;
        display: flex;
        flex-direction: column;
        align-items: center;

        button {
          color: var(--color-highlight);
          font-size: 0.8rem;
          font-family: inherit;
          width: 100%;
        }
      }

      .feedback { top: 96px; left: 40px; }
      .hpf { top: 168px; left: 12px; }
      .lpf { top: 168px; right: 40px; }
      .mix { top: 84px; right: 14px; }
    }
  }
</style>
