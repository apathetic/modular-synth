<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted } from 'vue';
  import { Envelope } from '~/audio/modules/envelope';

  /*
    Thin UI shell around `Envelope`.
    The component's job is to own the four reactive refs bound to the knobs
    and forward their values into the class.
  */
  export default defineComponent({
    name: 'Env',

    props: {
      id: {
        default: undefined,
        required: true,
      },
    },

    setup(_props, { expose }) {
      const env = new Envelope({ attack: 0.1, decay: 0.1, sustain: 0.6, release: 0.1 });

      const A = ref(env.attack);
      const D = ref(env.decay);
      const S = ref(env.sustain);
      const R = ref(env.release);

      watch(A, (v) => { env.attack  = v; });
      watch(D, (v) => { env.decay   = v; });
      watch(S, (v) => { env.sustain = v; });
      watch(R, (v) => { env.release = v; });

      onUnmounted(() => env.destroy());

      expose({
        inlets: env.inlets,
        outlets: env.outlets,
      });

      return {
        A, D, S, R,
        inlets: env.inlets,
        outlets: env.outlets,
      };
    },
  });
</script>


<template>
  <div class="env">
    <div class="module-details">
      <h3>ADSR</h3>
    </div>

    <div class="module-interface">
      <div class="name-bar">ENV</div>
      <div class="knobs">
        <div class="env-stage">
          <knob param="attack"  variant="pointer" size="small" @value="A = $event" :min="0.01" :max="1" :default="0.1" :precision="2"></knob>
          <svg class="stage-icon attack" viewBox="0 0 24 24"><path d="M4 20 L20 4" /></svg>
        </div>
        <div class="env-stage">
          <knob param="decay"   variant="pointer" size="small" @value="D = $event" :min="0.01" :max="1" :default="0.2" :precision="2"></knob>
          <svg class="stage-icon decay" viewBox="0 0 24 24"><path d="M4 4 L20 20" /></svg>
        </div>
        <div class="env-stage">
          <knob param="sustain" variant="pointer" size="small" @value="S = $event" :min="0.01" :max="1" :default="0.8" :precision="2"></knob>
          <svg class="stage-icon sustain" viewBox="0 0 24 24"><path d="M4 12 L20 12" /></svg>
        </div>
        <div class="env-stage">
          <knob param="release" variant="pointer" size="small" @value="R = $event" :min="0.01" :max="1" :default="0.3" :precision="2"></knob>
          <svg class="stage-icon release" viewBox="0 0 24 24"><path d="M4 4 Q 4 20 20 20" /></svg>
        </div>
      </div>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .env {

    .module-interface {
      background: linear-gradient(to bottom, #383633 0%, #32312e 98%, #242320 100%);
      color: #fff;
    }

    .knobs {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 6px 8px;
      gap: 4px;
    }

    .env-stage {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .stage-icon {
      width: 24px;
      height: 24px;
      fill: none;
      stroke-width: 4;
      stroke-linecap: round;
    }

    .stage-icon.attack, .stage-icon.decay, .stage-icon.release {
      stroke: #4bc4c5;
    }

    .stage-icon.sustain {
      stroke: #f57b54;
    }

    .knob {
      fill: #fff;
      min-width: 48px;
    }
  }
</style>
