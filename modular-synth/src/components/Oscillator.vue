//------------------------------------------------
//  OSCILLATOR
// -----------------------------------------------

// http://webaudio.github.io/web-audio-api/#idl-def-OscillatorNode
//

<template>
  <div class="node">
    <select v-model="type">
      <option v-for="type in types" v-bind:value="type">{{ type }}</option>
    </select>
    <knob :value.sync="freq" :min="220" :max="880"></knob>
  </div>
</template>

<script>
import Knob from './Knob';

export default {
  components: {
    Knob
  },

  data() {
    return {
      freq: 440,
      type: 'sine',
      types: ['sine', 'square', 'sawtooth', 'triangle', 'custom']
    };
  },

  created() {
    // Our lovely webAudio Oscillator.
    this.osc = this.context.createOscillator();
    this.osc.type = this.t;
    this.osc.frequency.value = this.freq;

    this.output = this.context.createGain();
    this.osc.connect(this.output);


    // if (output) {
    //   if (output == 'masterOut') {
    //     console.log('Routing %s to MasterOut', elem);
    //     scope.osc.connect(masterOut);
    //   } else {
    //     var destination = document.querySelector('#'+output);
    //     if (destination.input) {
    //       // connect the osc's output to the referenced input
    //       console.log('Routing %s to %s', elem, destination.input);
    //       scope.osc.connect(destination.input);
    //     } else {
    //       console.log('"%s" not found or is not an audio node', output);
    //     }
    //   }
    // } else {
    //   // hook up the node to its parent
    //   var parent = elem.parent();
    //   console.log('Routing %s to its parent: %s', elem[0].nodeName, parent[0].nodeName);
    // }


    // $vm.output.connect($vm.context.destination)


    this.$watch('freq', this.setFreq);
    this.$watch('type', this.setType);
  },

  computed: {},

  methods: {
    /**
     * k-rate control of the Oscillator frequency
     * @param  {Float} f frequency
     */
    setFreq(f) {
      console.log('setting freq: ', f);
      this.osc.frequency.value = f;
    },

    /**
     * Update wave type
     * @param  {String} t One of the pre-defined oscillator wave types
     */
    setType(t) {
      console.log('setting wave type: ', t);
      this.osc.type = t;
    },

    start() {
      this.osc.start();
    },

    stop() {
      this.osc.stop();
    }
  }
};
</script>

