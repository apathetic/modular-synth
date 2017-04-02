// base, extracted audio stuffs.
//

export const context = window.AudioContext && (new window.AudioContext());

//
//
// export function connect() {
//   this.output.connect(unit, outputNum, inputNum);
// }
//
//
// export function disconnect(output){
//   if (Array.isArray(this.output)){
//     output = this.defaultArg(output, 0);
//     this.output[output].disconnect();
//   } else if (!this.isUndef(output)){
//     this.output.disconnect(output);
//   } else {
//     this.output.disconnect();
//   }
//   return this;
// };

// *  use carefully. circumvents JS and WebAudio's normal Garbage Collection behavior
//   Tone.prototype.noGC = function(){
//     this.output.connect(_silentNode);
//     return this;
//   };
//

export const signal = {
  init() {
    // Generate (mono) buffer with 2 samples
    const source = this.context.createBufferSource();
    const buffer = this.context.createBuffer(1, 2, this.context.sampleRate);
    // const buffer = context.createBuffer(1, 128, context.sampleRate);

    // set each sample to 1
    buffer.getChannelData(0)[0] = 1;
    buffer.getChannelData(0)[1] = 1;
    // for (let i = 0; i < buffer.length; i++) {
    //   buffer.getChannelData(0)[i] = 1;
    // }


    source.channelCountMode = 'explicit';
    source.channelCount = 1;
    source.buffer = buffer;
    source.loop = true;

    source.start(0);
  }
};


export const stuffs = {};
