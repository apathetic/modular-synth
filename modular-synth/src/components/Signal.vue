<template>
  <div
  class="signal module _2U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <knob label="freq" @value="freq = $event" :min="1" :max="880"></knob>
    </div>

    <div class="module-connections">
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>


<script>
  import { draggable } from '../mixins/draggable';
  import Knob from './UI/Knob';

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
        name: 'Signal',
        outlets: [
          {
            label: 'output',
            data: null
          }
        ]
      };
    },

    created() {
      // --------- taken from from Tone.js  -----------
      const context = this.context;
      const constant = context.createBufferSource();
      const buffer = context.createBuffer(1, 128, context.sampleRate);
      const arr = buffer.getChannelData(0);

      for (let i = 0; i < arr.length; i++) {
        arr[i] = 1;
      }

      constant.channelCount = 1;
      constant.channelCountMode = 'explicit';
      constant.buffer = buffer;
      constant.loop = true;
      constant.start(0);
      // constant.noGC();



      this.outlets[0].data = this.gain = context.createGain();
      // this.inlets[0] = this.gain.gain;
      constant.connect(this.gain);

      this.$watch('mod', this.setGain);

      console.log('Creating Signal module');
    },

    methods: {
      /**
       * Update Signal output voltage
       * @param  {Float} g  Gain, between 0 and 1.
       */
      setGain(g) {
        this.gain.gain.value = g;
      }

    }
  };

</script>

<style lang="scss">
  .signal {
    background: green;
  };
</style>
