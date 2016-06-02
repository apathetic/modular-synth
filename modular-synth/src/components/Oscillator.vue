//------------------------------------------------
//  OSCILLATOR
// -----------------------------------------------

<template>

  <div>
    <p>freq {{ freq }}</p>
    <p>type {{ type }}</p>
    <p>out  {{ out }}</p>
  </div>
<!--   <oscillator type="saw" output="masterOut">
    <knob param="freq" default="455" min="220" max="880"></knob>
  </oscillator>
 -->
</template>



<script>
export default {
  data() {
    return {
      freq: 440,
      type: 'sine',
      output: 'masterOut'
      // min 220?
      // max 880 ?
    };
  },
  created() {
    console.log(this);


    // Our lovely webAudio Oscillator.
    this.osc = this.context.createOscillator();
    this.osc.type = this.type || 'sine';
    this.osc.frequency.value = this.freq || '440';

    this.input = this.context.createGainNode();
    this.output = this.context.createGainNode();

    this.input.connect(this.osc);
    this.osc.connect(this.output);

    // Here are the interfaces available to control the oscillator:
    // Update Frequency (@ control rate)
    this.$watch('freq', function(f) {
      console.log('f', f);
      this.osc.frequency.value = f;
    });



    // we hook up everything in the link function -- ie. after all
    // webAudio audio nodes have been successfully instantiated
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


    // OSCILLATOR-IFY
    this.osc.start();
  },
  methods: {
    freq(f) {
      this.freq = f;
    }
  }
};
</script>

