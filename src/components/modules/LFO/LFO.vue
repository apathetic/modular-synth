<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted, computed } from 'vue';
  import { useAppStore } from '~/stores/app';
  import { LFO, type LFOWaveform } from '~/audio/modules/lfo';

  function useStoreParam<T>(moduleId: number, name: string, fallback: T) {
    const store = useAppStore();
    return computed<T>({
      get: () => (store.getParameter(moduleId, name) as T) ?? fallback,
      set: (value) => store.setParameter({ moduleId, param: name, value: value as any })
    });
  }

  export default defineComponent({
    name: 'LFO',
    props: {
      id: {
        default: undefined,
        required: true,
      },
    },

    setup(_props, { expose }) {
      const moduleId = _props.id as unknown as number;

      const rate     = useStoreParam<number>(moduleId, 'rate', 2.0);
      const phase    = useStoreParam<number>(moduleId, 'phase', 0);
      const shape    = useStoreParam<number>(moduleId, 'shape', 0);
      const waveform = useStoreParam<LFOWaveform>(moduleId, 'waveform', 'triangle');

      const lfo = new LFO({
        rate:     rate.value,
        shape:    shape.value,
        waveform: waveform.value,
      });

      const inlets  = lfo.inlets;
      const outlets = lfo.outlets;

      watch(rate,     (v) => { lfo.rate = v; });
      watch(shape,    (v) => { lfo.shape = v; });
      watch(waveform, (v) => { lfo.waveform = v; });

      const waveforms: LFOWaveform[] = ['sine', 'triangle', 'shark', 'saw', 'square', 'random'];

      const cycleWaveform = () => {
        const idx = waveforms.indexOf(waveform.value);
        waveform.value = waveforms[(idx + 1) % waveforms.length];
      };

      const resetPhase = () => {
        lfo.reset();
      };

      onUnmounted(() => lfo.destroy());

      expose({
        inlets,
        outlets,
      });

      return {
        inlets,
        outlets,
        rate,
        phase,
        shape,
        waveform,
        cycleWaveform,
        resetPhase,
      };
    },
  });
</script>

<template>
  <div class="lfo">
    <div class="module-details">
      <h3>LFO</h3>
    </div>

    <div class="module-interface">
      <button @mousedown.stop.prevent="resetPhase" class="reset" title="Reset Phase">
        <svg viewBox="0 0 100 100" width="16" height="16">
          <path d="M 20 20 V 80 M 35 20 L 80 50 L 35 80 Z" fill="currentColor" />
        </svg>
      </button>

      <Knob class="knob-rate"  param="rate"  @value="rate = $event"  :min="0.05" :max="50" :default="2" :precision="2" mode="log" variant="arc" size="large"></Knob>
      <!-- <Knob class="knob-phase" param="phase" @value="phase = $event" :min="0" :max="360" :default="0" :precision="0" variant="skirted" size="small"></Knob> -->
      <Knob class="knob-shape" param="shape" @value="shape = $event" :min="-100" :max="100" :default="0" :precision="0" variant="skirted" size="small"></Knob>

      <div class="text-lfo">LFO</div>

      <button class="waveform-display" @mousedown.stop.prevent="cycleWaveform" title="Cycle Waveform">
        <svg viewBox="0 0 100 100" width="36" height="36" class="wave-icon">
          <path v-if="waveform === 'sine'" d="M 0 50 Q 25 -10 50 50 T 100 50" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'triangle'" d="M 0 50 L 25 10 L 75 90 L 100 50" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'shark'" d="M 0 50 L 20 10 L 80 90 L 100 50" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'saw'" d="M 0 90 L 100 10 V 90" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'square'" d="M 0 90 V 10 H 50 V 90 H 100" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'random'" d="M 0 50 H 20 V 20 H 40 V 80 H 60 V 40 H 80 V 70 H 100" fill="none" stroke="currentColor" stroke-width="8"/>
        </svg>
      </button>
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>

<style>
  .lfo {
    .module-interface {
      background: linear-gradient(to bottom, #eeeeee 0%, #d8d8d8 98%, #b0b0b0 100%);
      color: #333;
      border-radius: var(--border-radius);
    }

    .reset {
      position: absolute;
      top: 0px;
      left: 2px;

      background: none;
      border: none;
      color: #333;
      cursor: pointer;
      padding: 4px;
    }
    .reset:hover {
      color: #000;
    }

    .knob-rate { position: absolute; top: 20px; left: 8px; }
    .knob-phase { position: absolute; top: 44px; right: 24px; }
    .knob-shape { position: absolute; top: 148px; left: 8px; }

    .knob-rate::after {
      bottom: 14px;
      color: var(--color-highlight);
      content: 'Hz';
      left: 50%;
      position: absolute;
      transform: translateX(-50%);
    }

    .text-lfo {
      font-size: 38px;
      font-style: italic;
      font-weight: 200;
      left: 30px;
      letter-spacing: 2px;
      position: absolute;
      top: 88px;
    }

    .waveform-display {
      align-items: center;
      background: none;
      border-radius: 50%;
      border: 2px solid #ef7b5a;
      color: #ef7b5a;
      cursor: pointer;
      display: flex;
      height: 50px;
      justify-content: center;
      padding: 0;
      position: absolute;
      right: 8px;
      top: 148px;
      width: 50px;
    }
  }
</style>
