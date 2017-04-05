// base, extracted audio stuffs.
//

/**
 * The application's audio context.
 * @type {AudioContext}
 */
export const context = window.AudioContext && (new window.AudioContext());

//
//
// export function connect() {
//   this.output.connect(unit, outputNum, inputNum);
// }
//
//
// export function disconnect(output){
//   if (Array.isArray(this.output)){
//     output = this.defaultArg(output, 0);
//     this.output[output].disconnect();
//   } else if (!this.isUndef(output)){
//     this.output.disconnect(output);
//   } else {
//     this.output.disconnect();
//   }
//   return this;
// };

// *  use carefully. circumvents JS and WebAudio's normal Garbage Collection behavior
//   Tone.prototype.noGC = function(){
//     this.output.connect(_silentNode);
//     return this;
//   };
//

/**
 * Constant stream of 1's  at the audio-rate.
 * Allows sample-accurate manipulation of a parameter, or a way to generate ASDRs.
 * @type {Object}
 */
let signals = {};  // memoize this shizz
export function signal(value = 1) {
  if (signals[value]) {
    return signals[value];
  } else {
    // Generate (mono) buffer with 2 samples
    const signal = context.createBufferSource();
    const buffer = context.createBuffer(1, 2, context.sampleRate);
    // const buffer = context.createBuffer(1, 128, context.sampleRate);

    // set each sample to 1
    buffer.getChannelData(0)[0] = value;    // 2 items, as Safari chokes on 1
    buffer.getChannelData(0)[1] = value;
    // for (let i = 0; i < buffer.length; i++) {
    //   buffer.getChannelData(0)[i] = value;
    // }

    signal.channelCountMode = 'explicit';
    signal.channelCount = 1;
    signal.buffer = buffer;
    signal.loop = true;
    signal.start(0);

    signals[value] = signal;

    return signal;
    // return context.createConstantSource(1);  // one day
  }
};

/**
 * Audio VU meter. Uses deprecated ScriptNode, tho'
 * @param {[type]} audioContext [description]
 * @param {[type]} clipLevel    [description]
 * @param {[type]} averaging    [description]
 * @param {[type]} clipLag      [description]
 */
export function audioMeter(audioContext, clipLevel, averaging, clipLag) {
  const processor = audioContext.createScriptProcessor(512);

  processor.clipping = false;
  processor.lastClip = 0;
  processor.volume = 0;
  processor.clipLevel = clipLevel || 0.98;
  processor.averaging = averaging || 0.95;
  processor.clipLag = clipLag || 750;

  // ----------------------------- [wes] commented:
  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  // processor.connect(audioContext.destination);
  // ---------------------------------------------

  processor.onaudioprocess = function(event) {
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

  processor.checkClipping = function() {
    if (!this.clipping) {
      return false;
    }
    if ((this.lastClip + this.clipLag) < window.performance.now()) {
      this.clipping = false;
    }
    return this.clipping;
  };

  processor.shutdown = function() {
    this.disconnect();
    this.onaudioprocess = null;
  };

  return processor;
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
