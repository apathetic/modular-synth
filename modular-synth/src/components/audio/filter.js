/**
 * "Voltage controlled filter"
 * Uses audio (a-rate) input to control the center frequency
 * of a band-pass filter
 */


var Filter = function (context){
  this.context = context;
  this.filter = context.createBiquadFilter();
  this.filter.type = 2; // bandpass

  this.input = context.createGainNode();
  this.output = context.createGainNode();

  this.input.connect(this.filter);
  this.filter.connect(this.output);
}

