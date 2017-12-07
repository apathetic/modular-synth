<template>
  <div
  class="drive module _2U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>Drive</h3>
    </div>

    <div class="module-interface">
      <Knob
        param="drive"
        :min="20"
        :max="1000"
        @value="drive = $event">
      </Knob>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
  import Knob from './UI/Knob';

  export default {
    components: { Knob },
    props: {
      id: null
    },

    data() {
      return {
        name: 'Drive',
        drive: 0.1,

        inlets: [
          { label: 'input' }
        ],
        outlets: [
          { label: 'output' }
        ]
      };
    },

    created() {
      this.inlets[0].audio = this.input = this.context.createGain();
      this.outlets[0].audio = this.output = this.context.createGain();

      this.$watch('drive', this.setDrive);
    },

    destroyed() {
    },

    methods: {
      setDrive(d) {
        // this.osc.frequency.value = f;
      }
    }
  };
</script>

<style lang="scss">
  .drive {
  }
</style>
