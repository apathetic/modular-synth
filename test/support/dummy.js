import { context } from '@/audio/index';

export const Dummy = {
  input: context.createGain(),
  connect: function(node) {
    this.input.connect(node);
  },
  disconnect: function() {
    this.input.disconnect();
  }
};

