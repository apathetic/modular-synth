/**
 * "Audio unit generator"
 * Uses audio (a-rate) OR control (k-rate) input to control the frequency
 */


var Oscillator = function (context){
  this.context = context;
  this.filter = context.createBiquadFilter();
  this.filter.type = 2; // bandpass

  this.input = context.createGainNode();
  this.output = context.createGainNode();

  this.input.connect(this.filter);
  this.filter.connect(this.output);
}

