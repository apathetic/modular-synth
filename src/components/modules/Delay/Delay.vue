<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted, computed } from 'vue';
  import { useAppStore } from '~/stores/app';
  import { MASTER_ID } from '~/audio/master';
  import { gain, filter, delay } from '~/audio';
  import { Knob, Button, Toggle } from '~/components/UI';

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
    components: { Knob, Button, Toggle },
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
      feedbackL.connect(delayR); // ping-pong cross feed
      lpfL.connect(wetL);

      // Right Path
      delayR.connect(hpfR);
      hpfR.connect(lpfR);
      lpfR.connect(feedbackR);
      feedbackR.connect(delayL); // ping-pong cross feed
      lpfR.connect(wetR);

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

      const wet = useStoreParam(moduleId, 'wet', 0.5);
      const dry = useStoreParam(moduleId, 'dry', 0.5);
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
        { label: 'Gate', data: handleGate }
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

      watch(wet, (v) => { wetL.gain.value = v; wetR.gain.value = v; }, { immediate: true });
      watch(dry, (v) => { dryL.gain.value = v; dryR.gain.value = v; }, { immediate: true });
      watch(feedback, (v) => { feedbackL.gain.value = v; feedbackR.gain.value = v; }, { immediate: true });
      
      watch(hpfFreq, (v) => { hpfL.frequency.value = v; hpfR.frequency.value = v; }, { immediate: true });
      watch(lpfFreq, (v) => { lpfL.frequency.value = v; lpfR.frequency.value = v; }, { immediate: true });

      // UI Actions
      const toggleSync = () => {
        isSync.value = isSync.value === 1 ? 0 : 1;
      };

      expose({ inlets, outlets });

      return {
        inlets, outlets,
        timeMs, divisionIdx, isSync, syncSource,
        wet, dry, feedback, hpfFreq, lpfFreq,
        divisions,
        toggleSync
      };
    }
  });
</script>

<template>
  <div class="delay">
    <div class="module-details">
      <h3>Delay</h3>
    </div>

    <div class="module-interface">
      <div class="time-section">
        <div class="time-header">
          <Button class="sync-btn" @mousedown.stop="toggleSync">
            {{ isSync === 1 ? 'SYNC' : 'MS' }}
          </Button>
          <Toggle
            v-if="isSync === 1"
            param="syncSource"
            :options="['INT', 'EXT']"
            title="Sync Source"
            @value="syncSource = $event"
          />
        </div>
        
        <Knob v-if="isSync === 0" param="timeMs" @value="timeMs = $event" :min="20" :max="5000" />
        <Knob v-else param="divisionIdx" @value="divisionIdx = $event" variant="pointer" :steps="divisions.map(d => d.label)" />
      </div>

      <Knob param="feedback" @value="feedback = $event" :min="0" :max="0.9" :precision="2" />
      <Knob param="hpf" @value="hpfFreq = $event" :min="20" :max="20000" mode="log" />
      <Knob param="lpf" @value="lpfFreq = $event" :min="20" :max="20000" mode="log" />
      <Knob param="wet" @value="wet = $event" :min="0" :max="1" :precision="2" />
      <Knob param="dry" @value="dry = $event" :min="0" :max="1" :precision="2" />
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id" />
      <Outlets :ports="outlets" :id="id" />
    </div>
  </div>
</template>

<style>
  .delay {
    --grey: var(--module-surface);
    --purple: #c35896;

    background:
      linear-gradient(187deg,                  var(--purple) 0%,  var(--purple) 22%, transparent 22%) no-repeat,
      linear-gradient(192deg, transparent 22%, var(--purple) 22%, var(--purple) 26%, transparent 26%) no-repeat,
      linear-gradient(196deg, transparent 22%, var(--purple) 22%, var(--purple) 25%, transparent 25%) no-repeat,
      linear-gradient(199deg, transparent 22%, var(--purple) 22%, var(--purple) 24%, transparent 24%) no-repeat,
      linear-gradient(201deg, var(--grey) 22%, var(--purple) 22%, var(--purple) 23%, var(--grey) 23%);

    background-position: 0 0, 0 5px, 100% 16px, 100% 38px, 100% 50px;
    background-size: 100%, 110%, 120%, 120%, 130%;

    .module-interface {
      & > * { position: absolute; }
      
      .time-section { 
        top: 20px; 
        left: 20px; 
        width: 60px; 
        position: absolute; 
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        gap: 4px; 
      }
      
      .time-header { 
        display: flex; 
        gap: 4px; 
        align-items: center; 
        width: 100%; 
        justify-content: center; 
      }
      
      .sync-btn { 
        font-size: 10px; 
        padding: 4px 6px; 
        width: auto;
      }

      /* feedback */
      & > :nth-child(2) { top: 20px; left: 110px; }
      /* hpf */
      & > :nth-child(3) { top: 120px; left: 20px; }
      /* lpf */
      & > :nth-child(4) { top: 120px; left: 110px; }
      /* wet */
      & > :nth-child(5) { top: 120px; left: 200px; }
      /* dry */
      & > :nth-child(6) { top: 20px; left: 200px; }
    }
  }
</style>
