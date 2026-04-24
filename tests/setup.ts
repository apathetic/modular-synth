import { vi } from 'vitest';

// Minimal AudioContext stub. Extend the returned shape whenever a new factory
// in `~/audio` gets imported from a test path (directly or transitively, as
// `~/audio/master` does at module load).
const makeAudioNode = () => ({
  connect: vi.fn(),
  disconnect: vi.fn(),
});

const makeAudioParam = () => ({
  value: 0,
  setValueAtTime: vi.fn(),
  linearRampToValueAtTime: vi.fn(),
  exponentialRampToValueAtTime: vi.fn(),
  cancelScheduledValues: vi.fn(),
});

window.AudioContext = vi.fn().mockImplementation(() => ({
  currentTime: 0,
  sampleRate: 44100,
  destination: makeAudioNode(),
  suspend: vi.fn().mockResolvedValue(undefined),
  resume: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  createMediaStreamSource: vi.fn(),
  createMediaElementSource: vi.fn(),
  createBufferSource: vi.fn().mockImplementation(() => ({
    ...makeAudioNode(),
    start: vi.fn(),
    stop: vi.fn(),
    loop: false,
  })),
  createBuffer: vi.fn().mockImplementation((channels: number, length: number) => ({
    length,
    numberOfChannels: channels,
    getChannelData: vi.fn(() => new Float32Array(length)),
  })),
  createGain: vi.fn().mockImplementation(() => ({
    ...makeAudioNode(),
    gain: makeAudioParam(),
  })),
  createOscillator: vi.fn().mockImplementation(() => ({
    ...makeAudioNode(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: makeAudioParam(),
    detune: makeAudioParam(),
    type: 'sine',
  })),
  createBiquadFilter: vi.fn().mockImplementation(() => ({
    ...makeAudioNode(),
    frequency: makeAudioParam(),
    Q: makeAudioParam(),
    gain: makeAudioParam(),
    detune: makeAudioParam(),
    type: 'lowpass',
  })),
  createDelay: vi.fn().mockImplementation(() => ({
    ...makeAudioNode(),
    delayTime: makeAudioParam(),
  })),
  createConstantSource: vi.fn().mockImplementation(() => ({
    ...makeAudioNode(),
    start: vi.fn(),
    stop: vi.fn(),
    offset: makeAudioParam(),
  })),
  createAnalyser: vi.fn().mockImplementation(() => ({
    ...makeAudioNode(),
    frequencyBinCount: 1024,
    fftSize: 2048,
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
  })),
  createWaveShaper: vi.fn().mockImplementation(() => ({
    ...makeAudioNode(),
    curve: null,
  })),
  decodeAudioData: vi.fn().mockImplementation((buffer, successCallback, _errorCallback) => {
    successCallback(buffer);
  }),
}));
