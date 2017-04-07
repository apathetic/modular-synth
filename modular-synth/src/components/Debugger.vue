<template>
  <div
  class="debugger module _1U"
  :class="{dragging: dragging}"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      {{ peak }}
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
    </div>
  </div>
</template>


<script>
  import { draggable } from '../mixins/draggable';

  export default {
    mixins: [draggable],
    props: {
      id: null,
      col: null,
      row: null
    },

    data() {
      return {
        name: 'Debugger',
        peak: 0,
        inlets: [
          {
            label: 'input'
            // audio: null
          }
        ]
      };
    },

    created() {
      /*
      Usage:
      audioNode = createAudioMeter(this.context,clipLevel,averaging,clipLag);
      this.context: the AudioContext you're using.
      clipLevel: the level (0 to 1) that you would consider "clipping".
         Defaults to 0.98.
      averaging: how "smoothed" you would like the meter to be over time.
         Should be between 0 and less than 1.  Defaults to 0.95.
      clipLag: how long you would like the "clipping" indicator to show
         after clipping has occured, in milliseconds.  Defaults to 750ms.
      Access the clipping through node.checkClipping(); use node.shutdown to get rid of it.
      */

      var processor = this.processor = this.context.createScriptProcessor(512);
      processor.onaudioprocess = volumeAudioProcess;
      processor.clipping = false;
      processor.lastClip = 0;
      processor.volume = 0;
      processor.clipLevel = 0.98;
      processor.averaging = 0.95;
      processor.clipLag = 750;

      // this will have no effect, since we don't copy the input to the output,
      // but works around a current Chrome bug.
      processor.connect(this.context.destination);

      processor.checkClipping = function() {
        if (!this.clipping) {
          return false;
        }

        if ((this.lastClip + this.clipLag) < window.performance.now()) {
          this.clipping = false;
          return this.clipping;
        };

        processor.shutdown = function() {
          this.disconnect();
          this.onaudioprocess = null;
        };

        return processor;
      };

      function volumeAudioProcess(event) {
        var buf = event.inputBuffer.getChannelData(0);
        var bufLength = buf.length;
        var sum = 0;
        var x;

        // Do a root-mean-square on the samples: sum up the squares...
        for (var i = 0; i < bufLength; i++) {
          x = buf[i];
          if (Math.abs(x) >= this.clipLevel) {
            this.clipping = true;
            this.lastClip = window.performance.now();
          }
          sum += x * x;
        }

        // ... then take the square root of the sum.
        var rms = Math.sqrt(sum / bufLength);

        // Now smooth this out with the averaging factor applied
        // to the previous sample - take the max here because we
        // want "fast attack, slow release."
        this.volume = Math.max(rms, this.volume * this.averaging);
      }


      // this.inlets[0].audio.connect(processor);
      this.inlets[0].audio = processor;

      this.loop();
    },
    methods: {
      loop() {
        this.peak = this.processor.volume.toFixed(3);
        // set up the next visual callback
        window.requestAnimationFrame(this.loop);
        // window.setTimeout(this.loop, 100);
      }
    }
  };

</script>

<style lang="scss">
  @import '../assets/scss/variables.scss';

  .analyser {
    overflow: hidden;

    .module-interface {
      padding: 0;
    }
    canvas {
      height: 222px;
      width: 356px;
      display: block;
      left: 1px;
      opacity: 0;
      transition: opacity $transition-time;
    }

    &.analysing {
      canvas {
        opacity: 1;
      }
    }
  };
</style>
