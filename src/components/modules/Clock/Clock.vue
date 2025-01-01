<template>
  <div class="module-details">
    <h3>Clock</h3>
  </div>
  <div class="module-interface">
    play button

    gate (bang) ring --> outputs bangs to gate outlet every N/BPM
    a ring visualizes the clock signal, in 8th 16th segments

    BPM 120

    shuffle (?) 0-100%

    reset / on/off  will send out a "reset gate" every N ticks


  </div>

</template>

<script lang="ts">
  import { defineComponent, ref, computed } from 'vue';
  import { getTransport } from 'tone';

  export default defineComponent({
    name: 'Clock',

    setup() {
      const transport = getTransport();

      function startTransport() {
        // all loops start when the Transport is started
        transport.start();
      }

      function stopTransport() {
        transport.stop();
      }

      function setBPM(bpm: number) {
        transport.bpm.value = bpm; // bpm.rampTo(800, 10);
      }

    }
  });
</script>

<style></style>
