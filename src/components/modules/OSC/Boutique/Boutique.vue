<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted } from 'vue';
  import { Boutique } from '@/audio/oscillators/composed/boutique';

  /*
    Thin UI shell around `Boutique`. Owns knob-bound reactive refs, routes
    knob changes into the module, and tears down the audio graph on unmount.
  */
  export default defineComponent({
    name: 'Boutique',

    props: {
      id: { default: undefined, required: true },
    },

    setup(_props, { expose }) {
      const sel    = ref<0 | 1 | 2 | 3>(0);
      const width  = ref(0);
      const fold   = ref(0);
      const sub    = ref(0);
      const detune = ref(0);
      const fm     = ref(200);
      const modA   = ref(1);
      const modB   = ref(1);

      const boutique = new Boutique({
        sel:    sel.value,
        width:  width.value,
        fold:   fold.value,
        sub:    sub.value,
        detune: detune.value,
        fm:     fm.value,
        modA:   modA.value,
        modB:   modB.value,
      });
      boutique.start();

      // Clamp + narrow the dropdown's string value to the sel domain before
      // handing it to the module.
      watch(sel, (v) => {
        const n = Math.max(0, Math.min(3, Number(v) | 0)) as 0 | 1 | 2 | 3;
        boutique.sel = n;
      });
      watch(width,  (v) => { boutique.width.value = v; });
      watch(fold,   (v) => { boutique.fold        = v; });
      watch(sub,    (v) => { boutique.sub         = v; });
      watch(detune, (v) => { boutique.detune.value = v; });
      watch(fm,     (v) => { boutique.fm.value   = v; });
      watch(modA,   (v) => { boutique.modA.value = v; });
      watch(modB,   (v) => { boutique.modB.value = v; });

      onUnmounted(() => boutique.destroy());

      // AUDIO
      expose({
        inlets:  boutique.inlets,
        outlets: boutique.outlets,
      });

      // UI
      return {
        inlets:  boutique.inlets,
        outlets: boutique.outlets,
        selOptions: ['sine', 'saw', 'triangle', 'pulse'],
        sel, width, fold, sub, detune, fm, modA, modB,
      };
    },
  });
</script>


<template>
  <div class="boutique">
    <div class="module-details">
      <h3>Boutique</h3>
    </div>

    <div class="module-interface">
      <Knob param="sel"    @value="sel    = $event" :min="0"    :max="3"    :step="1"></Knob>
      <Knob param="width"  @value="width  = $event" :min="-0.9" :max="0.9"  :precision="2"></Knob>
      <Knob param="fold"   @value="fold   = $event" :min="0"    :max="1"    :precision="2"></Knob>
      <Knob param="sub"    @value="sub    = $event" :min="0"    :max="1"    :precision="2"></Knob>
      <Knob param="detune" @value="detune = $event" :min="-500" :max="500"></Knob>
      <Knob param="fm"     @value="fm     = $event" :min="0"    :max="2000" :default="200"></Knob>
      <Knob param="modA"   @value="modA   = $event" :min="0"    :max="1"    :precision="2" :default="1"></Knob>
      <Knob param="modB"   @value="modB   = $event" :min="0"    :max="1"    :precision="2" :default="1"></Knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .boutique {
    background: linear-gradient(to bottom, #efe5d3 0%, #c8bea9 98%, #8e8672 100%);
    color: #2a2012;

    text { fill: #2a2012; }

    .knob { float: left; clear: none; }
  }
</style>
