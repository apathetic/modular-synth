<template>
  <div class="env">
    <div class="module-details">
      <h3>Env</h3>
    </div>

    <div class="module-interface">
      <knob param="attack"  @value="A = $event" :min="0.01" :max="1" :default="0.1" :precision="2"></knob>
      <knob param="decay"   @value="D = $event" :min="0.01" :max="1" :default="0.2" :precision="2"></knob>
      <knob param="sustain" @value="S = $event" :min="0.01" :max="1" :default="0.8" :precision="2"></knob>
      <knob param="release" @value="R = $event" :min="0.01" :max="1" :default="0.3" :precision="2"></knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted } from 'vue';
  import { Envelope } from '@/audio/modules/envelope';

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


<style>
  .env {
    background: linear-gradient(to bottom, #383633 0%, #32312e 98%, #242320 100%);
    color: #fff;

    .knob {
      fill: #fff;
    }
  }
</style>
