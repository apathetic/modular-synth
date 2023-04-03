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
      id: null
    },
    setup (props, { expose }) {
      const context = inject('context');
      const input = context.createGain();
      const output = context.createGain();
      const dryNode = context.createGain();
      const wetNode = context.createGain();
      const filter = context.createBiquadFilter();
      const delayNode = context.createDelay(5);
      const feedbackNode = context.createGain();

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
      const delay = ref(params.delay.default);
      const cutoff = ref(params.filter.default);

      dryNode.gain.value = dry.value;
      wetNode.gain.value = wet.value;
      feedbackNode.gain.value = feedback.value;
      delayNode.delayTime.value = delay.value / 1000.0;
      filter.frequency.value = cutoff.value;
      filter.type = 'lowpass';

      input.connect(delayNode);
      input.connect(dryNode);
      delayNode.connect(filter);
      filter.connect(feedbackNode);
      feedbackNode.connect(delayNode);
      feedbackNode.connect(wetNode);
      wetNode.connect(output);
      dryNode.connect(output);

      watch(wet, (v) => wetNode.gain.value = v);
      watch(dry, (v) => dryNode.gain.value = v);
      watch(feedback, (v) => feedbackNode.gain.value = v);
      watch(delay, (v) => delayNode.delayTime.value = v / 1000.0);
      watch(cutoff, (v) => filter.frequency.value = v);

      onUnmounted(() => {
        // input = null;
        // output = null;
        // dryNode = null;
        // wetNode = null;
        // filter = null;
        // delayNode = null;
        // feedbackNode = null;
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
        delay,
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
