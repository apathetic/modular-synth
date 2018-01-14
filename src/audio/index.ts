
/**
 * The application's audio context.
 * @type {AudioContext}
 */
export const context: AudioContext = AudioContext && new AudioContext();



type constants = { [key: number]: AudioBufferSourceNode };
let constants: constants = {};  // memoize this shizz??

/**
 * Generate a constant stream of 1's (or given value) at the audio-rate.
 * @param value The value, between 0 and 1, to generate.
 * @type {object}
 */
export function signal(value: number = 1) {
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
 * @class Provides a uniform interface to an automatable value. Accepts both
 *        A-rate and k-rate inputs (ie. connection agnostic), while allowing
 *        sample-accurate manipulation of any parameter.
 * @param {Number} value Initial value of the parameter.
 */
export class Parameter {
  public set: (value: number) => void;
  public input: GainNode | null;
  public output: GainNode | null;

  constructor(value: number = 0) {
    const param = context.createGain();

    param.gain.value = value;

    this.set = (value: number) => { param.gain.value = value; };
    this.output = param;
    this.input = param;

    // this.input = (audio) ? param.gain : param.gain.value

    signal(1).connect(param);
  }

  destroy() {
    // (<GainNode>this.output).disconnect();
    this.output && this.output.disconnect();
    this.input = this.output = null;
  }
}

export class Parameter2 extends GainNode {
  public set: (value: number) => void;
  public input: GainNode | null;
  public output: GainNode | null;

  constructor(value: number = 0) {
    super();

    const param = this; // context.createGain();

    param.gain.value = value;

    this.set = (value) => { param.gain.value = value; };
    signal(1).connect(param);

    return param;
  }

  destroy() {
    this.disconnect();
  }
}



/**
 * @class Audio VU meter. Uses deprecated ScriptNode, tho'
 * @param {AudioContext} audioContext The webaudio context.
 * @param {Float} clipLevel    The rms peak at which it is considered to clip.
 * @param {Float} averaging    [description]
 * @param {Integer} clipLag    The release time, in ms, after clipping.
 */
export class Meter /* extends ScriptProcessorNode*/ {
  // private processor: ScriptProcessorNode;
  private clipLevel: number;
  private clipping: boolean;
  private lastClip: number;
  private clipLag: number;
  private volume: number;
  private averaging: number;

  constructor(clipLevel = 0.98, averaging = 0.95, clipLag = 750) {
    // if (!context) { return; }

    const processor = this.processor = context.createScriptProcessor(512);

    processor.onaudioprocess = this.processAudio;

    this.clipping = false;
    this.lastClip = 0;
    this.volume = 0;
    this.clipLevel = clipLevel; //  || 0.98;
    this.averaging = averaging; //  || 0.95;
    this.clipLag = clipLag; //  || 750;

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(context.destination);
    // ---------------------------------------------

    return processor;
  }

  processAudio(event: AudioProcessingEvent) {
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
 * @class Creates a wrapper around the Oscillator AudioNode, with the ability
 *        to start and stop playing.
 * @param {Number} f Initial frequency of the oscillator.
 * @param {String} t Initial type of the oscillator.
 */
export class Oscillator {
  private osc: OscillatorNode;
  private type: OscillatorType;
  public frequency: Parameter | null;
  public output: OscillatorNode;

  constructor(f: number = 440, t: OscillatorType = 'sine') {
    this.osc = context.createOscillator();
    this.osc.type = this.type = t;
    this.frequency = new Parameter(f);
    this.frequency.output!.connect(this.osc.frequency);
    this.output = this.osc;
  }

  start() {
    this.osc.start();
  }

  stop() {
    this.osc.stop();
    this.frequency = null;  // .destroy(); ?
  }
}



/**
 * Create a sawtooth oscillator. By adding a DC offset, we can move it up or
 * down. We then threshold the result to either 1 or -1 using a waveshaper,
 * which turns it square ie. a PWM waveform.
 * Reference: https://github.com/pendragon-andyh/WebAudio-PulseOscillator
 */
export class PWM {
  private _saw: OscillatorNode | null; // null so we can destroy(?)
  private _curve: Float32Array | null;
  private _pulseShaper: WaveShaperNode | null;
  public frequency: Parameter;
  public width: Parameter;
  public output: WaveShaperNode;

  constructor(f: number = 440, w: number = 0.5) {
    (<Parameter>this.frequency) = new Parameter(f);
    (<Parameter>this.width) = new Parameter(w);

    this._curve = this.generateCurve();

    // create sawtooth
    this._saw = context.createOscillator();
    this._saw.type = 'sawtooth';

    // create the waveshaper
    this._pulseShaper = context.createWaveShaper();
    this._pulseShaper.curve = this._curve;

    // connectify
    this._saw.connect(this._pulseShaper);

    // output
    this.output = this._pulseShaper;

    //start
    this.frequency.output!.connect(this._saw.frequency); // control the frequency
    this.width.output!.connect(this._pulseShaper); // control pulse width
    this._saw.start();
  }

  // /**
  //  * Start the Oscillator
  //  */
  // start() {
  //   this.frequency.output.connect((<OscillatorNode>this._saw).frequency); // control the frequency
  //   this.width.output.connect(<WaveShaperNode>this._pulseShaper);         // control pulse width
  //   (<OscillatorNode>this._saw).start();
  // }

  /**
   * Un-start the Oscillator
   */
  stop() {
    (<OscillatorNode>this._saw).disconnect();
    (<WaveShaperNode>this._pulseShaper).disconnect();

    this.frequency.destroy();
    this.width.destroy();

    this._saw = null;
    this._curve = null;
    this._pulseShaper = null;
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


