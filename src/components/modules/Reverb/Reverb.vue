<template>
  <div class="reverb">
    <div class="module-details">
      <h3>Reverb</h3>
    </div>

    <div class="module-interface">
      <knob param="seconds" @value="seconds = $event" :min="0" :max="5"></knob>
      <knob param="decay" @value="decay = $event"     :min="0" :max="5"></knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"></Inlets>
      <Outlets :ports="outlets"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, inject, ref, watch, onUnmounted } from 'vue';
  // import Knob from './UI/Knob';

  export default defineComponent({
    name: 'Reverb',

    props: {
      id: null
    },

    setup (props, { expose }) {

      const context = inject('context');
      const reverb = context.createConvolver();
      const seconds = ref(3); // props.seconds
      const decay = ref(2);   // props/decay

      const inlets = [
        {
          label: 'input-1',
          desc: '',
          audio: reverb,
        },
        {
          label: 'input-2',
          desc: '',
          // audio: ...
        }
      ];

      const outlets = [
        {
          label: 'output-1',
          desc: '',
          audio: reverb,
        },
        {
          label: 'output-2'
        }
      ];


      watch(seconds, setReverb);
      watch(decay, setDecay);

      onUnmounted(() => reverb.disconnect());

      /**
       * k-rate control of the Reverb
       * @param  {Float} s reverb in seconds
       */
      function setReverb(s) {
        reverb.reverb.value = s;
      }

      /**
       * k-rate control of the Reverb decay
       * @param  {Float} d decay in seconds
       */
      function setDecay(d) {
        reverb.decay.value = d;
      }

      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        seconds,
        decay,
        inlets,
        outlets
      }
    }
  });
</script>


<style lang="scss">
  .reverb {
    background: linear-gradient(to bottom, #e6dcce 0%, #c9c1b0 98%, #8a8478 100%);
    color: #000;

    text {
      color: #000;
    }
  }
</style>
