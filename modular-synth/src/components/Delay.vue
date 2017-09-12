<template>
  <div
  class="delay module _4U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <Knob @value="delay = $event"    :min="20" :max="1000"></Knob>
      <Knob @value="wet = $event"      :min="0"  :max="1"   :decimals="2"></Knob>
      <Knob @value="dry = $event"      :min="0"  :max="1"   :decimals="2"></Knob>
      <Knob @value="feedback = $event" :min="0"  :max="0.9" :decimals="2"></Knob>
      <Knob @value="cut = $event"      :min="20" :max="20000"></Knob>
      <!-- <Knob @value="diffusion = $event" min="220" max="880"></Knob> -->
      <!-- <Knob @value="spread = $event"    min="220" max="880"></Knob> -->
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
import { draggable } from '../mixins/draggable';
import Knob from './UI/Knob';

const params = {
  delay: {
    default: 100,
    min: 20,
    max: 1000
  },
  feedback: {
    default: 0.45,
    min: 0,
    max: 0.9
  },
  cutoff: {
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
    default: 1,
    min: 0,
    max: 1
  }
};

export default {
  mixins: [draggable],
  components: { Knob },
  props: {
    id: null,
    col: null,
    row: null
  },

  data() {
    return {
      name: 'Delay',
      delay: params.delay.default,
      wet: params.wet.default,
      dry: params.dry.default,
      feedback: params.feedback.default,
      cutoff: params.cutoff.default,

      inlets: [
        { label: 'in-1' },
        { label: 'in-2' },
        { label: 'mod' }
      ],
      outlets: [
        { label: 'out-1' },
        { label: 'out-2' }
      ]
    };
  },

  created() {
    this.inlets[0].audio = this.input = this.context.createGain();
    this.outlets[0].audio = this.output = this.context.createGain();

    this.activateNode = this.context.createGain();
    this.dry = this.context.createGain();
    this.wet = this.context.createGain();
    this.filter = this.context.createBiquadFilter();
    this.delay = this.context.createDelay(10);
    this.feedbackNode = this.context.createGain();

    this.activateNode.connect(this.delay);
    this.activateNode.connect(this.dry);
    this.delay.connect(this.filter);
    this.filter.connect(this.feedbackNode);
    this.feedbackNode.connect(this.delay);
    this.feedbackNode.connect(this.wet);
    this.wet.connect(this.output);
    this.dry.connect(this.output);

    this.filter.type = 'lowpass';

    // this.$watch('delay', this.setFreq);
    this.$watch('wet', this.setWet);
    this.$watch('dry', this.setDry);
    this.$watch('feedback', this.setFeedback);
    this.$watch('cutoff', this.setCutoff);

    console.log('Creating Delay');
  },

  destroyed() {
    // this.inlets[0].disconnect();
    // this.outlets[0].disconnect();
    this.activateNode.disconnect();
    this.delay.disconnect();
    this.filter.disconnect();
    this.feedbackNode.disconnect();
    this.wet.disconnect();
    this.dry.disconnect();
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
