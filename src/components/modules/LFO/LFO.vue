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
  <div class="oscillator lfo-module">
    <div class="module-details">
      <h3>LFO</h3>
    </div>

    <div class="module-interface">
      <div class="name-bar">LFO</div>

      <!-- Controls Row -->
      <div class="transport-controls">
        <button @click="resetPhase" class="btn-reset" title="Reset Phase">
          <svg viewBox="0 0 100 100" width="16" height="16">
            <path d="M 20 20 V 80 M 35 20 L 80 50 L 35 80 Z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <!-- Knobs -->
      <Knob class="knob-rate" param="rate" @value="rate = $event" :min="0.05" :max="50" :default="2" :precision="2" mode="log" variant="skirted" size="large"></Knob>
      <Knob class="knob-phase" param="phase" @value="phase = $event" :min="0" :max="360" :default="0" :precision="0" variant="skirted" size="small"></Knob>
      <Knob class="knob-shape" param="shape" @value="shape = $event" :min="-100" :max="100" :default="0" :precision="0" variant="skirted" size="small"></Knob>

      <div class="labels">
        <span class="lbl-rate">{{ rate }}Hz</span>
        <span class="lbl-phase">PHASE</span>
        <span class="lbl-shape">SHAPE</span>
      </div>

      <div class="text-lfo">LFO</div>

      <button class="waveform-display" @click="cycleWaveform" title="Cycle Waveform">
        <svg viewBox="0 0 100 100" width="36" height="36" class="wave-icon">
          <path v-if="waveform === 'sine'" d="M 0 50 Q 25 -10 50 50 T 100 50" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'triangle'" d="M 0 50 L 25 10 L 75 90 L 100 50" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'shark'" d="M 0 50 L 20 10 L 80 90 L 100 50" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'saw'" d="M 0 90 L 100 10 V 90" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'square'" d="M 0 90 V 10 H 50 V 90 H 100" fill="none" stroke="currentColor" stroke-width="8"/>
          <path v-if="waveform === 'random'" d="M 0 50 H 20 V 20 H 40 V 80 H 60 V 40 H 80 V 70 H 100" fill="none" stroke="currentColor" stroke-width="8"/>
        </svg>
      </button>

      <div class="led-indicator"></div>
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>

<style>
  .lfo-module {
    background: linear-gradient(to bottom, #eeeeee 0%, #d8d8d8 98%, #b0b0b0 100%);
    color: #333;
    width: 100%;
    height: 100%;
    position: relative;

    .module-interface {
      border: solid rgb(166,166,166);
      border-width: 0 3px;
      height: 100%;
      position: relative;
    }

    .name-bar {
      font-size: 11px;
      color: #666;
      padding: 4px 8px;
    }

    .transport-controls {
      position: absolute;
      top: 24px;
      left: 60px;
    }

    .btn-reset {
      background: none;
      border: none;
      color: #333;
      cursor: pointer;
      padding: 4px;
    }
    .btn-reset:hover {
      color: #000;
    }

    .knob-rate { position: absolute; top: 40px; left: 16px; }
    .knob-phase { position: absolute; top: 44px; right: 24px; }
    .knob-shape { position: absolute; top: 140px; left: 24px; }

    .labels {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;

      span {
        position: absolute;
        font-size: 10px;
        text-align: center;
        width: 40px;
        transform: translateX(-50%);
        color: #555;
      }

      .lbl-rate { top: 95px; left: 45px; color: #4faeb2; }
      .lbl-phase { top: 95px; left: 140px; }
      .lbl-shape { top: 195px; left: 42px; }
    }

    .text-lfo {
      position: absolute;
      top: 105px;
      left: 20px;
      font-size: 38px;
      font-style: italic;
      font-weight: 200;
      color: #555;
      letter-spacing: 2px;
    }

    .waveform-display {
      position: absolute;
      top: 135px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #ef7b5a;
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef7b5a;
      padding: 0;
    }
    
    .waveform-display:hover {
      background: rgba(239, 123, 90, 0.1);
    }

    .led-indicator {
      position: absolute;
      top: 110px;
      right: 32px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #ef7b5a;
      box-shadow: 0 0 4px #ef7b5a;
    }
  }
</style>
