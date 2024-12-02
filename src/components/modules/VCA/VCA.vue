<template>
  <div class="vca">
    <div class="module-details">
      <h3>VCA</h3>
    </div>

    <div class="module-interface">
      VCA
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, inject, ref, watch, onUnmounted } from 'vue';

  export default defineComponent({
    name: 'VCA',

    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {
      const context: AudioContext = inject('context');
      const vca = context.createGain();

      vca.gain.value = 0;

      const inlets = [
        {
          label: 'signal',
          audio: vca,
        },
        {
          label: 'gain',
          desc: 'The signal (gain) that will be used to multiply the input',
          audio: vca.gain
        }
      ];

      const outlets = [
        {
          label: 'output',
          audio: vca
        }
      ];


      onUnmounted(() => {
        // this.inlets[0].audio.disconnect(); // this is done in Connection
      });


      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        inlets,
        outlets
      };
    }
  });
</script>


<style lang="scss">
  .vca {
    background: linear-gradient(to bottom, #242320 0%, #181310 98%, #101310 100%);
    color: #fff;

    .knob {
      fill: #fff;
    }
  }
</style>
