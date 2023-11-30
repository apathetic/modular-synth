<template>
  <div class="compressor">
    <div class="module-details">
      <h3>Compressor</h3>
    </div>

    <div class="module-interface">
      ....
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
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
        name: 'Compressor',

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
    },

    // destroyed() {
    // },

    methods: {
    }
  };
</script>

<style lang="scss">
  .compressor {
  }
</style>
