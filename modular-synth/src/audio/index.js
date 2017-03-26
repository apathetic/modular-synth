// base, extracted audio stuffs.
//
// export const context = window.AudioContext && (new window.AudioContext());
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
    // --------- taken from from Tone.js  -----------
    // const context = this.context;
    // const constant = context.createBufferSource();
    // const buffer = context.createBuffer(1, 128, context.sampleRate);
    // const arr = buffer.getChannelData(0);
    //
    // for (let i = 0; i < arr.length; i++) {
    //   arr[i] = 1;
    // }
    //
    // constant.channelCount = 1;
    // constant.channelCountMode = 'explicit';
    // constant.buffer = buffer;
    // constant.loop = true;
    // constant.start(0);
    // constant.noGC();
  }
};

export Class Analyser {

  constructor() {
    this._analyser = this.context.createAnalyser();
    this._buffer = new Float32Array(this._analyser.frequencyBinCount);

    // FFT
    this._analyser.getFloatFrequencyData(this._buffer);

    // waveform
  if (this.isFunction(AnalyserNode.prototype.getFloatTimeDomainData)){
    this._analyser.getFloatTimeDomainData(this._buffer);
  } else {
    var uint8 = new Uint8Array(this._buffer.length);
    this._analyser.getByteTimeDomainData(uint8);
    // referenced https://github.com/mohayonao/get-float-time-domain-data
    // POLYFILL
    for (var i = 0; i < uint8.length; i++){
      this._buffer[i] = (uint8[i] - 128) * 0.0078125;
    }
  }
    //...

  var fft = new Tone.Analyser("fft", 32);





			//drawing the FFT
			var fftContext = $("<canvas>",{
				"id" : "fft"
			}).appendTo("#Content").get(0).getContext("2d");
			function drawFFT(values){
				fftContext.clearRect(0, 0, canvasWidth, canvasHeight);
				var barWidth = canvasWidth / fft.size;
				for (var i = 0, len = values.length; i < len; i++){
					var val = values[i] / 255;
					var x = canvasWidth * (i / len);
					var y = val * canvasHeight;
					fftContext.fillStyle = "rgba(0, 0, 0, " + val + ")";
					fftContext.fillRect(x, canvasHeight - y, barWidth, canvasHeight);
				}
			}
			//the waveform data
			var waveContext = $("<canvas>", {
				"id" : "waveform"
			}).appendTo("#Content").get(0).getContext("2d");
			var waveformGradient;
			function drawWaveform(values){
				//draw the waveform
				waveContext.clearRect(0, 0, canvasWidth, canvasHeight);
				var values = waveform.analyse();
				waveContext.beginPath();
				waveContext.lineJoin = "round";
				waveContext.lineWidth = 6;
				waveContext.strokeStyle = waveformGradient;
				waveContext.moveTo(0, (values[0] / 255) * canvasHeight);
				for (var i = 1, len = values.length; i < len; i++){
					var val = values[i] / 255;
					var x = canvasWidth * (i / len);
					var y = val * canvasHeight;
					waveContext.lineTo(x, y);
				}
				waveContext.stroke();
			}
			//size the canvases
			var canvasWidth, canvasHeight;
			function sizeCanvases(){
				canvasWidth = $("#fft").width();
				canvasHeight = $("#fft").height();
				waveContext.canvas.width = canvasWidth;
				fftContext.canvas.width = canvasWidth;
				waveContext.canvas.height = canvasHeight;
				fftContext.canvas.height = canvasHeight;
				//make the gradient
				waveformGradient = waveContext.createLinearGradient(0, 0, canvasWidth, canvasHeight);
				waveformGradient.addColorStop(0, "#ddd");
				waveformGradient.addColorStop(1, "#000");
			}
			sizeCanvases();
			$(window).resize(sizeCanvases);
			function loop(){
				requestAnimationFrame(loop);
				//get the fft data and draw it
				var fftValues = fft.analyse();
				drawFFT(fftValues);
				//get the waveform valeus and draw it
				var waveformValues = waveform.analyse();
				drawWaveform(waveformValues);
			}
			loop();




        /*
        function SpectrumAnalyzer (audioNode, minRange, maxRange) {
            this.audioNode = audioNode;
            this.analyser = audioCtx.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.maxDecibels = 0;
            this.analyser.minDecibels = -100;

            this.array = new Float32Array(this.analyser.frequencyBinCount);
            this.minRange = minRange ||  0;
            this.maxRange = maxRange ||  audioCtx.sampleRate;
            audioNode.connect(this.analyser);
        }

        SpectrumAnalyzer.prototype = {
            update: function () {
                this.analyser.getFloatFrequencyData(this.array);
            },
            render: function (ctx) {
                var length = this.array.length;
                var fftSize = this.analyser.fftSize;
                var W = ctx.canvas.width;
                var H = ctx.canvas.height;
                var minDb = this.analyser.minDecibels;
                var maxDb = this.analyser.maxDecibels;
                var fy = function (y) {
                    y = (y-minDb)/(maxDb-minDb); // normalize
                    return (1-y) * H;
                }
                ctx.clearRect(0,0,W,H);
                ctx.beginPath();
                ctx.fillStyle = "#acd";
                ctx.moveTo(0, H);
                var iStart = Math.floor(fftSize*this.minRange/audioCtx.sampleRate);
                var iStop = Math.floor(fftSize*this.maxRange/audioCtx.sampleRate);
                var range = iStop-iStart;
                for (var i=iStart; i<=iStop; ++i) {
                    ctx.lineTo(W*(i-iStart)/range, fy(this.array[i]));
                }
                ctx.lineTo(W, H);
                ctx.fill();

                var step = GridUtils.findNiceRoundStep(this.maxRange, 4);
                var prefix = step>=1000 ? "k" : "";
                ctx.fillStyle = "#357";
                for (var i=this.minRange+step; i<this.maxRange; i+=step) {
                    var text = prefix=="k" ? Math.round(i/1000) : i;
                    var x = W*i/this.maxRange;
                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, 5);
                    ctx.stroke();
                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";
                    ctx.font = "14px sans-serif";
                    ctx.fillText(text, x, 6);
                }
                ctx.textAlign = "right";
                ctx.fillStyle = "#79b";
                ctx.fillText("freq in "+prefix+"Hz", W, 20);
                ctx.font = "14px sans-serif";
            }
      */
}


export const stuffs = {};
