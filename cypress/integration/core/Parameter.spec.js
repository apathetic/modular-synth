// import { shallow, mount, createLocalVue } from 'vue-test-utils'
// import { createRenderer } from 'vue-server-renderer'
import { Parameter } from '../../../src/audio';
import dummy from '../../../src/components/Node.vue';
// import { dummy } from '../../support/dummy';
// import { VCO } from '/src/components/node';

// const localVue = createLocalVue();

describe('Parameter', () => {
  it('handles input connections', () => {
    const param = new Parameter();
    dummy.output.connect(param.input);
  });

  it('handles output connections', () => {
    const param = new Parameter();
    param.input.connect(dummy.output);
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
