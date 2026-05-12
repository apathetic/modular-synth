<script lang="ts">
  // import Knob from './UI/Knob';
  import { defineComponent, inject, ref, watch, onUnmounted } from 'vue';
  import { Parameter, gain } from '~/audio';

  export default defineComponent({
    name: 'Mixer',

    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {
      const gain1 = gain(0);
      const gain2 = gain(0);
      const gain3 = gain(0);
      const gain4 = gain(0);
      const output = gain(1);

      const one = ref(0);
      const two = ref(0);
      const three = ref(0);
      const four = ref(0);

      const inlets = [
        { label: 'in-1', audio: gain1 },
        { label: 'in-2', audio: gain2 },
        { label: 'in-3', audio: gain3 },
        { label: 'in 4', audio: gain4 },
        { label: 'mod',  data: 'mod' },
      ];

      const outlets = [
        { label: 'out-1', audio: output }
      ];


      // connectify
      gain1.connect(output);
      gain2.connect(output);
      gain3.connect(output);
      gain4.connect(output);

      // Scale the gain values from 0-100 to 0-1 to prevent clipping
      watch(one, (v) => gain1.gain.value = v / 100);
      watch(two, (v) => gain2.gain.value = v / 100);
      watch(three, (v) => gain3.gain.value = v / 100);
      watch(four, (v) => gain4.gain.value = v / 100);

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


<template>
  <div class="mixer">
    <div class="module-details">
      <h3>Mixer</h3>
    </div>

    <div class="module-interface">
      <Knob param="one"   @value="one = $event"   :min="0" :max="100" variant="pointer"></knob>
      <Knob param="two"   @value="two = $event"   :min="0" :max="100" variant="pointer"></knob>
      <Knob param="three" @value="three = $event" :min="0" :max="100" variant="pointer"></knob>
      <Knob param="four"  @value="four = $event"  :min="0" :max="100" variant="pointer"></knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .mixer {
    background:
      linear-gradient(45deg, #333 0%, #333 48%, transparent 48%) no-repeat,
      linear-gradient(135deg, transparent 52%, #333 52%, transparent 100%);

    .knob {
      position: absolute;
      transform: scale(1.2);
      fill: #fff;

      &:nth-child(1) { top: 12px; left: 10px; }
      &:nth-child(2) { top: 62px; right: 12px; }
      &:nth-child(3) { top: 112px; left: 10px; }
      &:nth-child(4) { top: 162px; right: 12px; }



      &:nth-child(3)::after,
      &:nth-child(2)::after,
      &:nth-child(1)::after {
            content: '';
            position: absolute;
            top: 46px;
            width: 100px;
            height: 1px;
            background: #ffffff55;
      }
      &:nth-child(1)::after,
      &:nth-child(3)::after {
            left: -4px;
            transform: rotate(-20deg);
      }
      &:nth-child(2)::after {
            transform: rotate(20deg);
            right: -4px;
      }


    }
  }
</style>
