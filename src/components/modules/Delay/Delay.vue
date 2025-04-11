<template>
  <div class="delay">
    <div class="module-details">
      <h3>Delay</h3>
    </div>

    <div class="module-interface">
      <Knob param="delay"    @value="delay = $event"    :min="20" :max="5000"></Knob>
      <Knob param="wet"      @value="wet = $event"      :min="0"  :max="1"   :precision="2"></Knob>
      <Knob param="dry"      @value="dry = $event"      :min="0"  :max="1"   :precision="2"></Knob>
      <Knob param="feedback" @value="feedback = $event" :min="0"  :max="0.9" :precision="2"></Knob>
      <Knob param="cut"      @value="cutoff = $event"   :min="20" :max="20000"></Knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, inject, ref, watch, onUnmounted } from 'vue';
  import { gain, filter, delay } from '@/audio';

  const params = {
    delay: {
      default: 100,
      min: 20,
      max: 5000
    },
    feedback: {
      default: 0.45,
      min: 0,
      max: 0.9
    },
    filter: {
      default: 20000,
      min: 20,
      max: 20000
    },
    wet: {
      default: 0.5,
      min: 0,
      max: 1
    },
    dry: {
      default: 0.5,
      min: 0,
      max: 1
    }
  };

  export default defineComponent({
    props: {
      id: {
        default: undefined,
        required: true
      }
    },
    setup (props, { expose }) {
      const input = gain();
      const output = gain();
      const dryNode = gain(params.dry.default);
      const wetNode = gain(params.wet.default);
      const filterNode = filter('lowpass', params.filter.default);
      const delayNode = delay(params.delay.default / 1000.0, 5);
      const feedbackNode = gain(params.feedback.default);

      const inlets = [
        {
          label: 'in',
          desc: 'Signal input',
          audio: input
        },
        {
          label: 'mod',
          desc: 'Modulation input for delay time',
          audio: null
        }
      ];
      const outlets = [
        {
          label: 'out-1',
          audio: output
        }
        // { label: 'out-2' }
      ];

      const dry = ref(params.dry.default);
      const wet = ref(params.wet.default);
      const feedback = ref(params.feedback.default);
      const delayTime = ref(params.delay.default);
      const cutoff = ref(params.filter.default);

      input.connect(delayNode);
      input.connect(dryNode);
      delayNode.connect(filterNode);
      filterNode.connect(feedbackNode);
      feedbackNode.connect(delayNode);
      feedbackNode.connect(wetNode);
      wetNode.connect(output);
      dryNode.connect(output);

      watch(wet, (v) => wetNode.gain.value = v);
      watch(dry, (v) => dryNode.gain.value = v);
      watch(feedback, (v) => feedbackNode.gain.value = v);
      watch(delayTime, (v) => delayNode.delayTime.value = v / 1000.0);
      watch(cutoff, (v) => filterNode.frequency.value = v);

      onUnmounted(() => {
        // clean disconnections happen in Connection component
      });

      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        dry,
        wet,
        feedback,
        delay: delayTime,
        cutoff,

        inlets,
        outlets
      }
    }
  });
</script>


<style lang="scss">
  $grey: #a8a8a8;
  $purple: #c35896;

  .delay {
    background:
      linear-gradient(187deg,                  $purple 0%,  $purple 22%, transparent 22%) no-repeat,
      linear-gradient(192deg, transparent 22%, $purple 22%, $purple 26%, transparent 26%) no-repeat,
      linear-gradient(196deg, transparent 22%, $purple 22%, $purple 25%, transparent 25%) no-repeat,
      linear-gradient(199deg, transparent 22%, $purple 22%, $purple 24%, transparent 24%) no-repeat,
      linear-gradient(201deg, $grey 22%,       $purple 22%, $purple 23%, $grey 23%);

    background-position: 0 0, 0 5px, 100% 16px, 100% 38px, 100% 50px;
    background-size: 100%, 110%, 120%, 120%, 130%;
  }
</style>
