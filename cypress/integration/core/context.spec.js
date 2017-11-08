import { context } from '../../../src/audio/index';

describe('context', () => {
  it ('exists', () => {
    expect(context).to.be.instanceof(AudioContext); // sanity check that our test env works
  });

  it ('has the required Audio Nodes', () => {
    expect(context).to.have.property('createGain');
    expect(context.createGain()).to.be.instanceOf(GainNode);
    expect(context).to.have.property('createOscillator');
    expect(context.createOscillator()).to.be.instanceOf(OscillatorNode);
    expect(context).to.have.property('createDelay');
    expect(context.createDelay()).to.be.instanceOf(DelayNode);
  });

  // context.close();
});