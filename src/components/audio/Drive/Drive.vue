<template>
  <div class="drive">
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
      <Inlets :ports="inlets"></Inlets>
      <Outlets :ports="outlets"></Outlets>
    </div>
  </div>
</template>

<script lang="ts">
  // import Knob from './UI/Knob';

  export default {
    // components: { Knob },
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

    // destroyed() {
    // },

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
