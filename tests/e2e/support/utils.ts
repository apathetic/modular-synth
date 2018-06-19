import { context } from '@/audio/';


export const _Dummy = {
  input: context.createGain(),
  connect: function(node) {
    this.input.connect(node);
  },
  disconnect: function() {
    this.input.disconnect();
  }
};
export const Dummy = context.createGain();


export const Utils = {
  wasDisposed: function(obj) {
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
  }
};



