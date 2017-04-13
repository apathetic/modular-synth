//------------------------------------------------
//  Delay
// -----------------------------------------------

<template>
  <div
  class="delay module _4U"
  :class="{dragging: 'dragging'}"
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

      inlets: [{ label: 'input' }],
      outlets: [{ label: 'output' }]
    };
  },

  created() {
    this.inlets[0].audio = this.input = this.context.createGain();
    this.outlets[0].audio = this.output = this.context.createGain();

    const activateNode = this.context.createGain();
    const dry = this.context.createGain();
    const wet = this.context.createGain();
    const filter = this.context.createBiquadFilter();
    const delay = this.context.createDelay(10);
    const feedbackNode = this.context.createGain();

    activateNode.connect(delay);
    activateNode.connect(dry);
    delay.connect(filter);
    filter.connect(feedbackNode);
    feedbackNode.connect(delay);
    feedbackNode.connect(wet);
    wet.connect(this.output);
    dry.connect(this.output);

    filter.type = 'lowpass';

    this.$watch('delay', this.setFreq);
    this.$watch('wet', this.setWet);
    this.$watch('dry', this.setDry);
    this.$watch('feedback', this.setFeedback);
    this.$watch('cutoff', this.setCutoff);

    console.log('Creating Delay');
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
