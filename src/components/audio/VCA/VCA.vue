<template>
  <div class="vca">
    <div class="module-details">
      <h3>VCA</h3>
    </div>

    <div class="module-interface">
      VCA
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets"></Inlets>
      <Outlets :ports="outlets"></Outlets>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      id: null
    },

    data() {
      return {
        name: 'VCA',
        inlets: [
          {
            label: 'signal'
            // audio: null,
            // data: null
          }, {
            label: 'gain'
            // audio: null
          }
        ],

        outlets: [
          {
            label: 'output'
            // audio: null
          }
        ]
      };
    },

    created() {
      const vca = this.context.createGain();
      // IMPORTANT. Set ORIGINAL gain value i.e. "offset"... which is what is ADDED into future signals. I Think...???
      // If this is not set, than any signal in will... be additive to itself, or ...something
      vca.gain.value = 0;

      this.inlets[0].audio = vca;
      this.inlets[1].audio = vca.gain;

      this.outlets[0].audio = vca;
    },

    destroyed() {
      // this.inlets[0].audio.disconnect(); // this is done in Connection
    }
  };
</script>

<style lang="scss">
  .vca {
    background: linear-gradient(to bottom, #242320 0%, #181310 98%, #101310 100%);
    color: #fff;

    .knob {
      fill: #fff;
    }
  }
</style>
