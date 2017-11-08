import { context } from '../../src/audio/index'
// import { createLocalVue } from 'vue-test-utils'
// const localVue = createLocalVue();


let dummy = {
  input: context.createGain()
};

dummy.connect = function(node){
  this.input.connect(node);
  this.input.disconnect();
};


export default dummy;