<template>
  <div class="mixer">
    <div class="module-details">
      <h3>Mixer</h3>
    </div>

    <div class="module-interface">
      <knob param="one"   @value="one = $event"   :min="0" :max="100"></knob>
      <knob param="two"   @value="two = $event"   :min="0" :max="100"></knob>
      <knob param="three" @value="three = $event" :min="0" :max="100"></knob>
      <knob param="four"  @value="four = $event"  :min="0" :max="100"></knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"></Inlets>
      <Outlets :ports="outlets"></Outlets>
    </div>
  </div>
</template>

<script lang="ts">
  // import Knob from './UI/Knob';
  import { defineComponent, inject, ref, watch, onUnmounted } from 'vue';
  import { Parameter } from '@/audio';

  export default defineComponent({
    name: 'Mixer',

    props: {
      id: null
    },

    setup (props, { expose }) {
      const context: AudioContext = inject('context');
      const gain1 = context.createGain();
      const gain2 = context.createGain();
      const gain3 = context.createGain();
      const gain4 = context.createGain();
      const output = context.createGain();

      const one = ref(0);
      const two = ref(0);
      const three = ref(0);
      const four = ref(0);

      const inlets = [
        { label: 'in-1', audio: gain1 },
        { label: 'in-2', audio: gain2 },
        { label: 'in-3', audio: gain3 },
        { label: 'in 4', audio: gain4 },
      ];

      const outlets = [
        { label: 'out-1', audio: output }
      ];


      // connectify
      gain1.connect(output);
      gain2.connect(output);
      gain3.connect(output);
      gain4.connect(output);

      watch(one, (v) => gain1.gain.value = v);
      watch(two, (v) => gain2.gain.value = v);
      watch(three, (v) => gain3.gain.value = v);
      watch(four, (v) => gain4.gain.value = v);

      // watch
      // function update() {
      //   numConnected = 1; // how many active connections
      //   output.gain.value = 1 / numConnected;
      // }

      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        inlets,
        outlets,
        one,
        two,
        three,
        four,
      }
    }
  });
</script>

<style lang="scss">
  $color: #333;
  .mixer {
    background:
      linear-gradient(45deg, $color 0%, $color 48%, transparent 48%) no-repeat,
      linear-gradient(135deg, transparent 52%, $color 52%, transparent 100%);

    .knob {
      position: absolute;
      transform: scale(1.2);
      fill: #fff;

      &:nth-child(1) { top: 44%; }
      &:nth-child(2) { left: 40%; }
      &:nth-child(3) { top: 44%; right: 10%; }
      &:nth-child(4) { bottom: 3%; left: 40%; }
    }
  }
</style>
