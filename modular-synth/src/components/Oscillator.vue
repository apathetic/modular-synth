//------------------------------------------------
//  OSCILLATOR
// -----------------------------------------------

// http://webaudio.github.io/web-audio-api/#idl-def-OscillatorNode
//

<template>
  <div class="node">
    <p>freq {{ freq }}</p>
    <p>type {{ type }}</p>
    <knob :value.sync="freq"></knob>
  </div>
</template>

<script>
import Knob from './Knob';

export default {
  components: {
    Knob
  },

  // propsData: [
  //   'freq',
  //   'type'
  // ],

  data() {
    return {
      freq: 440,
      type: 'sine'	// "square", "sawtooth", "triangle", "custom"
      // min 220?
      // max 880 ?
    };
  },

  created() {
    // Our lovely webAudio Oscillator.
    this.osc = this.context.createOscillator();
    this.osc.type = this.type;
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
  },
  methods: {
    /**
     * k-rate control of the Oscillator frequency
     * @param  {Float} f frequency
     */
    freq(f) {
      this.freq = f;
      this.osc.frequency.value = f;
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

