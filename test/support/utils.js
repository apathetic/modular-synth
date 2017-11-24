import { context } from '../../src/audio/index';
// import { createLocalVue } from 'vue-test-utils'
// const localVue = createLocalVue();


let Node = {
  input: context.createGain()
};

Node.connect = function(node) {
  this.input.connect(node);
  this.input.disconnect();
};


let Utils = {};
Utils.wasDisposed = function(obj) {
  for (var prop in obj) {
    var member = obj[prop];
    if (typeof member !== 'function' &&
      typeof member !== 'string' &&
      typeof member !== 'number' &&
      typeof member !== 'boolean' &&
      typeof member !== 'undefined' &&
      prop !== 'preset' &&
      !(member instanceof AudioContext) &&
      !obj.constructor.prototype[prop]) {
      if (member !== null) {
        throw Error('property was not completely disposed: ' + prop);
      }
    }
  }
};

export default {
  Utils,
  Node
};
