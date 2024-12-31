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

  export default defineComponent({
    name: 'Clock',

    setup() {

      // all loops start when the Transport is started
      Tone.getTransport().start();
      // ramp up to 800 bpm over 10 seconds
      Tone.getTransport().bpm.rampTo(800, 10);
    }
  });
</script>

<style></style>
