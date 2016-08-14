/**
 * Filter sweeps
 */

var Sweeper = function(context, scheduler){
  this.context = context;

  this.base;    // base frequency
  this.speed;   // sweep speed
  this.depth;   // sweep depth
  this.freq;    // filter centre frequency
  this.Q;       // filter sharpness

  this.input = context.createGainNode();
  this.output = context.createGainNode();

  this.setDefaults();
}

Sweeper.prototype = {
  setDefaults: function() {
    this.base = 124;  // (Hz)
    this.speed = 0.7; // (Hz)
    this.depth = 5;
    this.freq = 34;
    this.Q = 33;
  },
  setBase: function(base){
    this.base = base;
  },
  setSpeed: function(speed){
    this.speed = speed;
  },
  setDepth: function(depth){
    this.depth = depth;
  },
  setFreq: function(freq){
    this.freq = freq;
  },
  setQ: function(Q){
    this.Q = Q;
  },
  sweep: function(){

    // Create a Phasor.
    // Use a sawtooth as a base, add 1 and then multiply
    // by 0.5 to create a function that goes from 0 to 1
    var phasor = context.createOscillatorNode();
    phasor.type = 2;  // sawtooth


  }

}

