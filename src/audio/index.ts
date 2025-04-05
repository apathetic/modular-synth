// namespace µ {


/**
 * The application's audio context.
 * @type {AudioContext}
 */
// export const context: AudioContext = AudioContext && new AudioContext();
export const context: AudioContext = new AudioContext();

/**
 * Store references to all WebAudio components. They are indexed by
 * `id` - the same `id` used to referece the `module` in the $store.
 */
// type Nodes = {[value: number]: Node};
// export const registry: Nodes = {};

/**
 *
 */
type Constants = {[value: number]: AudioBufferSourceNode};
const constants: Constants = {};  // memoize this shizz??


/**
 * Generate a constant stream of 1's (or given value) at the audio-rate.
 * @param value The value to generate.
 * @returns {ConstantSourceNode}
 */
export function signal(value: number = 1) {
  const source = context.createConstantSource();
  const setValue = (value: number) => source.offset.value = value;

  setValue(value);

  // return source;
  // return {
  //   input: setValue,
  //   output: source,
  // }


  if (constants[value]) {
    return constants[value];
  } else {
    // Generate (mono) buffer with 2 samples
    const waveform = context.createBufferSource();
    const buffer = context.createBuffer(1, 2, context.sampleRate);

    // set each sample to "value"
    buffer.getChannelData(0)[0] = value;    // 2 items, as Safari chokes on 1
    buffer.getChannelData(0)[1] = value;

    waveform.channelCountMode = 'explicit';
    waveform.channelCount = 1;
    waveform.buffer = buffer;
    waveform.loop = true;
    waveform.start(0);

    constants[value] = waveform;

    return waveform;
  }
}


/**
 * @class Provides a uniform interface to an automatable value. Accepts both
 *        A-rate and k-rate inputs (ie. connection agnostic), while allowing
 *        sample-accurate manipulation of any parameter.
 * @param {Number} value Initial value of the parameter.
 */
export class Parameter {
  public set: (value: number) => void;
  public input: GainNode;
  public output: GainNode;

  constructor(value: number = 0) {
    const param = context.createGain();

    param.gain.value = value;

    this.set = (v: number) => { param.gain.value = v; };
    this.output = param;
    this.input = param;

    // this.input = (audio) ? param.gain : param.gain.value

    signal(1).connect(param);

    // return param;
  }

  public destroy() {
    // (<GainNode>this.output).disconnect();
    this.output && this.output.disconnect();
    // this.input = this.output = undefined; // can set GainNode to undefined
  }
}


/**
 * @class Audio VU meter.
 * https://stackoverflow.com/questions/44360301/web-audio-api-creating-a-peak-meter-with-analysernode
 */
export class Meter {
  public averaging: number;
  public volume: number;
  public rms: number;
  public peak: number;
  public input: AudioNode;
  public output: AudioNode;
  private analyser: AnalyserNode;
  private buffer: Float32Array;

  constructor(averaging = 0.95) {
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 1024;
    this.buffer = new Float32Array(this.analyser.fftSize);
    this.input = this.output = this.analyser;
    this.volume = 0;
    this.averaging = averaging;
    this.rms = this.peak = 0;

    // return this.analyser;
  }

  public process() {
    let sumOfSquares = 0;
    let peak = 0;
    const buffer = this.buffer;

    // Copies the connected signal's time-domain samples into the buffer
    this.analyser.getFloatTimeDomainData(buffer);

    // Compute average power and find peak instantaneous power
    // for (let i = 0; i < buffer.length; i++) {
    //   const power = buffer[i] ** 2;
    for (const sample of buffer) {
      const power = sample ** 2;
      sumOfSquares += power;
      peak = Math.max(power, peak);
    }


    // in Db:
    // this.rms = 10 * Math.log10(sumOfSquares / buffer.length);
    // this.peak = 10 * Math.log10(peak);
    this.rms = sumOfSquares / buffer.length;
    this.peak = peak;

    // this.volume = Math.max(this.rms, this.volume * this.averaging);
  }
}


/**
 * @class Creates a wrapper around the Oscillator AudioNode, with the ability
 *        to start and stop playing.
 * @param {Number} f Initial frequency of the oscillator.
 * @param {String} t Initial type of the oscillator.
 */
export class Oscillator {
  public frequency: Parameter;
  public output: OscillatorNode;
  private osc: OscillatorNode;
  private type: OscillatorType;

  constructor(f: number = 440, t: OscillatorType = 'sine') {
    this.osc = context.createOscillator();
    this.osc.type = this.type = t;
    this.frequency = new Parameter(f);
    this.frequency.output!.connect(this.osc.frequency);
    this.output = this.osc;
  }

  public start() {
    this.osc.start();
  }

  public stop() {
    this.osc.stop();
    this.frequency.destroy();
  }
}


/**
 * Create a sawtooth oscillator. By adding a DC offset, we can move it up or
 * down. We then threshold the result to either 1 or -1 using a waveshaper,
 * which turns it square ie. a PWM waveform.
 * Reference: https://github.com/pendragon-andyh/WebAudio-PulseOscillator
 */
export class PWM {
  public frequency: Parameter;
  public width: Parameter;
  public output: WaveShaperNode;
  private saw: OscillatorNode | null; // null so we can destroy(?)
  private curve: Float32Array | null;
  private pulseShaper: WaveShaperNode | null;

  constructor(f: number = 440, w: number = 0.5) {
    this.frequency = new Parameter(f);
    this.width = new Parameter(w);
    // (<Parameter>this.width) = new Parameter(w);

    this.curve = this.generateCurve();

    // create sawtooth
    this.saw = context.createOscillator();
    this.saw.type = 'sawtooth';

    // create the waveshaper
    this.pulseShaper = context.createWaveShaper();
    this.pulseShaper.curve = this.curve;

    // connectify
    this.saw.connect(this.pulseShaper);

    // output
    this.output = this.pulseShaper;

    // start
    this.frequency.output!.connect(this.saw.frequency); // control the frequency
    this.width.output!.connect(this.pulseShaper); // control pulse width
    this.saw.start();
  }

  // /**
  //  * Start the Oscillator
  //  */
  // start() {
  //   this.frequency.output.connect((<OscillatorNode>this.saw).frequency); // control the frequency
  //   this.width.output.connect(<WaveShaperNode>this.pulseShaper);         // control pulse width
  //   (<OscillatorNode>this.saw).start();
  // }

  /**
   * Un-start the Oscillator
   */
  public stop() {
    (this.saw as OscillatorNode).disconnect();
    (this.pulseShaper as WaveShaperNode).disconnect();

    this.frequency.destroy();
    this.width.destroy();

    this.saw = null;
    this.curve = null;
    this.pulseShaper = null;
  }

  /**
   * Generate a curve to be used in Waveshaping the Sawtooth wave.
   * NOTE: why 256 samples?? No idea. A goodly number I guess
   */
  private generateCurve() {
    const pulseCurve = new Float32Array(256);

    for (let i = 0; i < 128; i++) {
      pulseCurve[i] = -1;
      pulseCurve[i + 128] = 1;
    }

    return pulseCurve;
  }
}

// }
