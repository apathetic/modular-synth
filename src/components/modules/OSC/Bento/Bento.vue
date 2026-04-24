<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted } from 'vue';
  import { Bento } from '~/audio/oscillators/composed/bento';

  /*
    Thin UI shell around `Bento`. All DSP (sawpulse cores, mod chains, VCA,
    fold envelope) lives in the class; the shell owns reactive knob refs,
    forwards them to the module on change, and disposes the graph on unmount.
  */
  export default defineComponent({
    name: 'Bento',

    props: {
      id: { default: undefined, required: true },
    },

    setup(_props, { expose }) {
      const shape  = ref(0.5);
      const width  = ref(0);
      const detune = ref(0);
      const fm     = ref(200);
      const modA   = ref(0.5);
      const modB   = ref(0.5);

      const bento = new Bento({
        shape:  shape.value,
        width:  width.value,
        detune: detune.value,
        fm:     fm.value,
        modA:   modA.value,
        modB:   modB.value,
      });
      bento.start();

      watch(shape,  (v) => { bento.shape = v; });
      watch(width,  (v) => { bento.width.value = v; });
      watch(detune, (v) => { bento.detune.value = v; });
      watch(fm,     (v) => { bento.fm.value = v; });
      watch(modA,   (v) => { bento.modA.value = v; });
      watch(modB,   (v) => { bento.modB.value = v; });

      onUnmounted(() => bento.destroy());

      // AUDIO
      expose({
        inlets:  bento.inlets,
        outlets: bento.outlets,
      });

      // UI
      return {
        inlets:  bento.inlets,
        outlets: bento.outlets,
        shape, width, detune, fm, modA, modB,
      };
    },
  });
</script>


<template>
  <div class="bento">
    <div class="module-details">
      <h3>Bento</h3>
    </div>

    <div class="module-interface">
      <Knob param="shape"  @value="shape  = $event" :min="0"    :max="1"    :precision="2" :default="0.5"></Knob>
      <Knob param="width"  @value="width  = $event" :min="-0.9" :max="0.9"  :precision="2"></Knob>
      <Knob param="detune" @value="detune = $event" :min="-500" :max="500"></Knob>
      <Knob param="fm"     @value="fm     = $event" :min="0"    :max="2000" :default="200"></Knob>
      <Knob param="modA"   @value="modA   = $event" :min="0"    :max="1"    :precision="2" :default="0.5"></Knob>
      <Knob param="modB"   @value="modB   = $event" :min="0"    :max="1"    :precision="2" :default="0.5"></Knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .bento {
    background: linear-gradient(to bottom, #3a3a3a 0%, #1f1f1f 100%);
    color: #eee;

    text { fill: #eee; }

    .knob { float: left; clear: none; }
  }
</style>
