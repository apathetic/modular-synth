
// Custom parameter - number of bits to crush down to - default 8
this.addParameter( "bits", 8 );

// Custom parameter - frequency reduction, 0-1, default 0.5
this.addParameter( "frequencyReduction", 0.5 );

onnodecreate=function(e) {
  e.node.timeToNextUpdate = 0.1 * sampleRate;
  e.node.smoothing = 0.5;
  e.node.clipLevel = 0.95;
  e.node.clipLag = 1;
  e.node.updatingInterval = 150;
  // This just handles setting attribute values
  e.node.onmessage = function ( event ) {
    if (event.data instanceof Object ) {
      if (event.data.hasOwnProperty("smoothing")
        this.smoothing = event.data.smoothing;
      if (event.data.hasOwnProperty("clipLevel")
        this.clipLevel = event.data.clipLevel;
      if (event.data.hasOwnProperty("clipLag")
        this.clipLag = event.data.clipLag / 1000;  // convert to seconds
      if (event.data.hasOwnProperty("updating")    // convert to samples
        this.updatingInterval = event.data.updating * sampleRate / 1000 ;
    }
  };
}

onaudioprocess = function ( event ) {
  var buf = event.inputs[0][0];  // Node forces mono
  var bufLength = buf.length;
  var sum = 0;
  var x;

  // Do a root-mean-square on the samples: sum up the squares...
  for (var i=0; i<bufLength; i++) {
    x = buf[i];
    if (Math.abs(x)>=event.node.clipLevel) {
      event.node.clipping = true;
      event.node.unsentClip = true;  // Make sure, for every clip, we send a message.
      event.node.lastClip = event.playbackTime + (i/sampleRate);
    }
    sum += x * x;
  }

  // ... then take the square root of the sum.
  var rms =  Math.sqrt(sum / bufLength);

  // Now smooth this out with the smoothing factor applied
  // to the previous sample - take the max here because we
  // want "fast attack, slow release."
  event.node.volume = Math.max(rms, event.node.volume*event.node.smoothing);
  if (event.node.clipping && (!event.node.unsentClip) && (event.playbackTime > (this.lastClip + clipLag)))
    event.node.clipping = false;

  // How long has it been since our last update?
  event.node.timeToNextUpdate -= event.node.last;
  if (event.node.timeToNextUpdate<0) {
    event.node.timeToNextUpdate = event.node.updatingInterval;
    event.node.postMessage(
      { "volume": event.node.volume,
        "clip": event.node.clipping });
    event.node.unsentClip = false;
  }
};
