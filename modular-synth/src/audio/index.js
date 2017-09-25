// base, extracted audio stuffs.
//

/**
 * The application's audio context.
 * @type {AudioContext}
 */
export const context = window.AudioContext && (new window.AudioContext());


/**
 * Constant stream of 1's at the audio-rate.
 * , or a way to generate ASDRs.
 * @type {Object}
 */
let constants = {};  // memoize this shizz??
export function signal(value = 1) {
  if (constants[value]) {
    return constants[value];
  } else {
    // Generate (mono) buffer with 2 samples
    const signal = context.createBufferSource();
    const buffer = context.createBuffer(1, 2, context.sampleRate);

    // set each sample to 1
    buffer.getChannelData(0)[0] = value;    // 2 items, as Safari chokes on 1
    buffer.getChannelData(0)[1] = value;

    signal.channelCountMode = 'explicit';
    signal.channelCount = 1;
    signal.buffer = buffer;
    signal.loop = true;
    signal.start(0);

    constants[value] = signal;

    return signal;
    // return context.createConstantSource(value);  // one day
  }
};


/**
 * @class An A-rate control that allows sample-accurate manipulation of any
 *        parameter. Accepts both A-rate and K-rate inputs.
 *        Reference: https://github.com/Tonejs/Tone.js/blob/master/Tone/signal/Signal.js
 * @param {Number} value Initial value of the parameter.
 */
export class Parameter {
  constructor(value = 0) {
    const param = context.createGain();

    param.value = value;
    this.output = param;
    this.input = param.gain;

    // this.input = (audio) ? param.gain : param.gain.value

    signal(1).connect(param);
  }
}


/**
 * @class Audio VU meter. Uses deprecated ScriptNode, tho'
 * @param {AudioContext} audioContext The webaudio context.
 * @param {Float} clipLevel    The rms peak at which it is considered to clip.
 * @param {Float} averaging    [description]
 * @param {Integer} clipLag    The release time, in ms, after clipping.
 */
export class Meter {

  constructor(canvas, clipLevel = 0.98, averaging = 0.95, clipLag = 750) {
    // if (!context) { return; }

    const processor = this.processor = context.createScriptProcessor(512);

    processor.onaudioprocess = this.processAudio;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel; //  || 0.98;
    processor.averaging = averaging; //  || 0.95;
    processor.clipLag = clipLag; //  || 750;

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(context.destination);
    // ---------------------------------------------

    return processor;
  }

  processAudio(event) {
    var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
    var sum = 0;
    var x;

    // Do a root-mean-square on the samples: sum up the squares...
    for (let i = 0; i < bufLength; i++) {
      x = buf[i];
      if (Math.abs(x) >= this.clipLevel) {
        this.clipping = true;
        this.lastClip = window.performance.now();
      }
      sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms = Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume * this.averaging);
  };
  //
  // checkClipping() {
  //   if (!this.clipping) {
  //     return false;
  //   }
  //   if ((this.lastClip + this.clipLag) < window.performance.now()) {
  //     this.clipping = false;
  //   }
  //   return this.clipping;
  // };
}


/**
 * Create a sawtooth oscillator. By adding a DC offset, we can move it up or
 * down. We then threshold the result to either 1 or -1 using a waveshaper,
 * which turns it into a square.
 * Reference: https://github.com/pendragon-andyh/WebAudio-PulseOscillator
 */
export class PWM {
  constructor() {
    this.frequency = null;
    this.width = null;
    this.output = null;

    this._curve = this.generateCurve();
  }

  /**
   * Start the Oscillator
   */
  start() {
    // create sawtooth
    this._saw = context.createOscillator();
    this._saw.type = 'sawtooth';

    // create the waveshaper
    this._pulseShaper = context.createWaveShaper();
    this._pulseShaper.curve = this._curve;

    // create the offset (ie. pulse width)
    this._offset = context.createGain();
    this._offset.gain.value = 0;      // default
    signal(1).connect(this._offset);  // feed it with constant 1 source

    // connectify
    this._saw.connect(this._pulseShaper);
    this._offset.connect(this._pulseShaper);

    // input / output
    this._saw.frequency.value = this.frequency; // control the frequency
    this._offset.gain.value = this.width;       // control PW
    this.output = this._pulseShaper;            // ouput
  }

  /**
   * Un-start the Oscillator
   */
  stop() {
    this.curve = this.output = this.frequency =
    this.output = this._saw = this._offset = this._pulseShaper = null;
  }

  /**
   * Generate a curve to be used in Waveshaping the Sawtooth wave.
   * NOTE: why 256 samples?? No idea. A goodly number I guess
   */
  generateCurve() {
    const pulseCurve = new Float32Array(256);

    for (let i = 0; i < 128; i++) {
      pulseCurve[i] = -1;
      pulseCurve[i + 128] = 1;
    }

    return pulseCurve;
  }
}


/**
 * @class Creates a wrapper around the Oscillator AudioNode, with the ability
 *        to start and stop playing.
 * @param {Number} f Initial frequency of the oscillator.
 * @param {String} t Initial type of the oscillator.
 */
export class Oscillator {
  constructor(f, t) {
    this.osc = null;
    this.frequency = signal(f);
    this.type = t;
    this.output = this.osc;
  }

  start() {
    this.osc = context.createOscillator();
    this.frequency.connect(this.osc.frequency);      // input connects to audioParam (freq) "mod"
    // this.gain.connect(this.osc.frequency);

    // this.frequency = this.osc.frequency.value;
  }

  destroy() {
    this.frequency.disconnect();
  }
}



/*
//
//
//
function setupNodeMessaging(node) {
  // This handles communication back from the volume meter
  node.onmessage = function(event) {
    if (event.data instanceof Object) {
      if (event.data.hasOwnProperty('clip')) {
        this.clip = event.data.clip;
      }
      if (event.data.hasOwnProperty('volume')) {
        this.volume = event.data.volume;
      }
    }
  };

  // Set up some default configuration parameters
  node.postMessage({
    'smoothing': 0.9,   // Smoothing parameter
    'clipLevel': 0.9,   // Level to consider 'clipping'
    'clipLag': 750,     // How long to keep 'clipping' lit up after clip (ms)
    'updating': 100      // How frequently to update volume and clip param (ms)
  });

  // Set up volume and clip attributes.  These will be updated by our onmessage.
  node.volume = 0;
  node.clip = false;
}

var meter = null; // well.... that won't work as it's statically bound at runtime...
// , vuFactory;
context.createAudioWorker('workers/meter.js').then(function(factory) {
  // cache 'factory' in case you want to create more nodes!
  // vuFactory = factory;
  meter = factory.createNode([1], []); // we don't need an output, and let's force to mono
  setupNodeMessaging(meter);
});

// window.requestAnimationFrame( function(timestamp) {
//   if (vuNode) {
//   // Draw a bar based on vuNode.volume and vuNode.clip
//   }
// });
*/
