<template>
  <div class="comb">
    <div class="module-details">
      <h3>Comb</h3>
    </div>

    <div class="module-interface">
      <Dropdown param="type"   @value="type = $event"     :options="types"></Dropdown>
      <Knob param="resonance" @value="resonance = $event" :min="0" :max="100"></Knob>
      <Knob param="cutoff"    @value="cutoff = $event"    :min="40" :max="16000" scale="log"></Knob>
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>

<script>
  import { defineComponent, inject, ref, watch } from 'vue';

  export default defineComponent({
    props: {
      id: {
        default: undefined,
        required: true
      }
    },
    setup (props, { expose }) {
      const context = inject('context');

      const types = ['lowpass', 'hipass', 'bandpass', 'notch'];
      const type = ref(types[0]);
      const freq = ref(440);
      const Q = ref(1);
      const resonance = ref(1);
      const cutoff = ref(8000);

      const filter = context.createBiquadFilter();
      filter.type = type.value;
      filter.frequency.value = freq.value;
      filter.Q.value = Q.value;

      const inlets = [
        {
          label: 'filter',
          audio: filter
        }, {
          label: 'xxxx',
          // audio: null
        }
      ];

      const outlets = [
        {
          label: 'output-1',
          audio: filter
        }, {
          label: 'output-2',
          audio: null
        }
      ];


      watch(type, setType);
      // $watch('freq', setDecay);
      // $watch('Q', setDecay);

      // destroyed() {
      //   filter.disconnect();// this is done in Connection
      // },

      function setFreq(f) {
        filter.frequency.value = f;
      }

      function setType(t) {
        filter.type = types[t] || 'lowpass';
      }

      expose({ inlets, outlets, setFreq, setType });

      return {
        resonance,
        cutoff,
        type,
        types,
        inlets,
        outlets
      }

    }
  });
</script>


<style lang="scss">
  $grey: #a8a8a8;
  $purple: #c35896;
  .comb {
    background:
      linear-gradient(187deg,                  $purple 0%,  $purple 22%, transparent 22%) no-repeat,
      linear-gradient(192deg, transparent 22%, $purple 22%, $purple 26%, transparent 26%) no-repeat,
      linear-gradient(196deg, transparent 22%, $purple 22%, $purple 25%, transparent 25%) no-repeat,
      linear-gradient(199deg, transparent 22%, $purple 22%, $purple 24%, transparent 24%) no-repeat,
      linear-gradient(201deg, $grey 22%,       $purple 22%, $purple 23%, $grey 23%);

    background-position: 0 0, 0 5px, 100% 16px, 100% 38px, 100% 50px;
    background-size: 100%, 110%, 120%, 120%, 130%;



    color: #fff;

    text {
      color: #fff;
    }
  }
</style>
