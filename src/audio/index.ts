
/**
 * The application's audio context.
 * @type {AudioContext}
 */
export const context: AudioContext = new AudioContext();
context.suspend();


/**
 *
 */
type Constants = {[value: number]: AudioBufferSourceNode};
const constants: Constants = {};  // memoize this shizz??


/**
 * Create a new WebAudio oscillator with the specified frequency and type.
 * @param {number} frequency - Initial frequency of the oscillator in Hz
 * @param {OscillatorType} type - Wave type of the oscillator
 * @returns {OscillatorNode} The created oscillator node
 */
export function oscillator(frequency: number = 440, type: OscillatorType = 'sine'): OscillatorNode {
  const osc = context.createOscillator();
  osc.frequency.value = frequency;
  osc.type = type;
  return osc;
}


/**
 * Create a new WebAudio gain node with the specified gain value.
 * @param {number} value - Initial gain value
 * @returns {GainNode} The created gain node
 */
export function gain(value: number = 1): GainNode {
  const gainNode = context.createGain();
  gainNode.gain.value = value;
  return gainNode;
}


/**
 * Create a new WebAudio biquad filter node with the specified parameters.
 * @param {BiquadFilterType} type - The type of filter
 * @param {number} frequency - Initial frequency value in Hz
 * @param {number} q - Initial Q value
 * @returns {BiquadFilterNode} The created filter node
 */
export function filter(type: BiquadFilterType = 'lowpass', frequency: number = 350, q: number = 1): BiquadFilterNode {
  const filterNode = context.createBiquadFilter();
  filterNode.type = type;
  filterNode.frequency.value = frequency;
  filterNode.Q.value = q;
  return filterNode;
}


/**
 * Create a new WebAudio delay node with the specified delay time.
 * @param {number} delayTime - Initial delay time in seconds
 * @param {number} maxDelayTime - Maximum possible delay time in seconds
 * @returns {DelayNode} The created delay node
 */
export function delay(delayTime: number = 0.1, maxDelayTime: number = 5): DelayNode {
  const delayNode = context.createDelay(maxDelayTime);
  delayNode.delayTime.value = delayTime;
  return delayNode;
}


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


// NOTE: the legacy `Oscillator` and `PWM` classes that lived here have been
// replaced by the `BasicOsc`/`Pulse`/etc. primitives under
// `src/audio/modules/oscillators/`. Import those directly when building
// composed oscillator modules.


/**
 * Create a new Parameter with the specified initial value.
 * @param {number} value - Initial value of the parameter
 * @returns {Parameter} The created parameter
 */
export function parameter(value: number = 0): Parameter {
  return new Parameter(value);
}

// }
