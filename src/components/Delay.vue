<template>
  <div class="delay">
    <div class="module-details">
      <h3>Delay</h3>
    </div>

    <div class="module-interface">
      <Knob param="delay"    @value="delay = $event"    :min="20" :max="5000"></Knob>
      <Knob param="wet"      @value="wet = $event"      :min="0"  :max="1"   :decimals="2"></Knob>
      <Knob param="dry"      @value="dry = $event"      :min="0"  :max="1"   :decimals="2"></Knob>
      <Knob param="feedback" @value="feedback = $event" :min="0"  :max="0.9" :decimals="2"></Knob>
      <Knob param="cut"      @value="cut = $event"      :min="20" :max="20000"></Knob>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
  import Knob from './UI/Knob';

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

  export default {
    components: { Knob },
    props: {
      id: null
    },

    data() {
      return {
        name: 'Delay',
        // delay: params.delay.default,
        // wet: params.wet.default,
        // dry: params.dry.default,
        // feedback: params.feedback.default,
        // cutoff: params.cutoff.default,
        params: params,

        inlets: [
          { label: 'in',
            desc: 'Signal input' },
          { label: 'mod',
            desc: 'Modulation input for delay time' }
        ],
        outlets: [
          { label: 'out-1' }
          // { label: 'out-2' }
        ]
      };
    },

    created() {
      this.inlets[0].audio = this.input = this.context.createGain();
      this.inlets[1].audio = this.context.createGain();  // input is -1 : 1
      this.outlets[0].audio = this.output = this.context.createGain();

      this.dryNode = this.context.createGain();
      this.wetNode = this.context.createGain();
      this.filter = this.context.createBiquadFilter();
      this.delayNode = this.context.createDelay(5);
      this.feedbackNode = this.context.createGain();

      this.dryNode.gain.value = params.dry.default;
      this.wetNode.gain.value = params.wet.default;
      this.feedbackNode.gain.value = params.feedback.default;
      this.delayNode.delayTime.value = params.delay.default / 1000.0;
      this.filter.frequency.value = params.filter.default;
      this.filter.type = 'lowpass';

      this.input.connect(this.delayNode);
      this.input.connect(this.dryNode);
      this.delayNode.connect(this.filter);
      this.filter.connect(this.feedbackNode);
      this.feedbackNode.connect(this.delayNode);
      this.feedbackNode.connect(this.wetNode);
      this.wetNode.connect(this.output);
      this.dryNode.connect(this.output);

      // this.$watch('delay', this.setFreq);
      this.$watch('wet', this.setWet);
      this.$watch('dry', this.setDry);
      this.$watch('feedback', this.setFeedback);
      this.$watch('cutoff', this.setCutoff);
    },

    destroyed() {
      // this.inlets[0].disconnect();
      // this.outlets[0].disconnect();
      // this.activateNode.disconnect();
      this.delayNode.disconnect();
      this.filter.disconnect();
      this.feedbackNode.disconnect();
      this.wetNode.disconnect();
      this.dryNode.disconnect();
    },

    methods: {
      setDelay(d) {
        // this.osc.frequency.value = f;
      },
      setWet(w) {},
      setDry(d) {},
      setFeedback(f) {},
      setCutoff(c) {}
    }
  };
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
