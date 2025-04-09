import { vi } from 'vitest';

window.AudioContext = vi.fn().mockImplementation(() => ({
  createMediaStreamSource: vi.fn(),
  createMediaElementSource: vi.fn(),
  createBufferSource: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    loop: false,
  })),
  decodeAudioData: vi.fn().mockImplementation((buffer, successCallback, _errorCallback) => {
    successCallback(buffer);
  }),
  destination: {},
}));
