import Puppeteer from 'Puppeteer';
import { context } from '../src/audio/index';

describe('context', () => {
  let browser, page;

  beforeEach(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
  }, 1000 * 30);

  afterEach(() => {
    browser.close()
  }, 1000 * 30);



  it ('exists...?', () => {
    expect(context).to.have.property('createGain');
    expect(context.createGain()).to.be.instanceOf(GainNode);
    expect(context).to.have.property('createOscillator');
    expect(context.createOscillator()).to.be.instanceOf(OscillatorNode);
    expect(context).to.have.property('createDelay');
    expect(context.createDelay()).to.be.instanceOf(DelayNode);

    return context.close();
  });

});