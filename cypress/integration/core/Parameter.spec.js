// import { shallow, mount, createLocalVue } from 'vue-test-utils'
// import { createRenderer } from 'vue-server-renderer'
import { Parameter } from '../../../src/audio'
import { node } from '../../support/utils';

// const localVue = createLocalVue();

describe('Parameter', () => {
  it('handles input connections', () => {
    const param = new Parameter();
    node.output.connect(param.input);
  });

  it('handles output connections', () => {
    const param = new Parameter();
    param.input.connect(node.output);
  });

  it('can set a value', () => {
    const value = 10;
    const param = new Parameter(value);

    // expect
  });

  it('can be cleaned up', () => {
    const param = new Parameter();
    param.destroy();

    // expect
  });
});
