//------------------------------------------------
//  OSCILLATOR
// -----------------------------------------------

<template>
  <div
    class="oscillator module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <select v-model="type">
        <option v-for="type in types" v-bind:value="type">{{ type }}</option>
      </select>
      <slider label="mod"  :value.sync="mod"  :min="0" :max="100"></slider>
      <knob   label="freq" :value.sync="freq" :min="1" :max="880"></knob>
      <knob   label="sync" :value.sync="sync" :min="0" :max="1"></knob>
      <knob   label="PW"   :value.sync="PW"   :min="0" :max="6.28"></knob>
    </div>

    <div class="module-connections">
      <partial name="inlets"></partial>
      <partial name="outlets"></partial>
    </div>
  </div>
</template>


<script>
  import { draggable } from '../mixins/draggable';
  import { newConnection } from '../store/actions';
  import { rackWidth, rackHeight } from '../dimensions';
  import Knob from './UI/Knob';
  import Slider from './UI/Slider2';
  import store from '../store/store'; // .... er...  this.$store...?

  export default {
    mixins: [draggable],
    components: { Knob, Slider },
    vuex: {
      actions: {
        newConnection
      }
    },
    props: {
      id: null,
      col: null,
      row: null
    },
    computed: {
      position() {
        return {
          //     this.$store.state.editing
          left: (store.state.editing || this.dragging) ? this.x + 'px' : this.col * rackWidth + 'px',
          top: (store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
        };
      }
    },

    data() {
      return {
        name: 'Oscillator',
        w: 1, // rack width
        h: 1, // rack height

        freq: 440,
        mod: 0,
        PW: 0,
        sync: 0,
        type: 'sine',
        types: ['sine', 'square', 'sawtooth', 'triangle'],

        inlets: [
          {
            port: 0,
            label: 'freq',
            // audio: null,
            data: null
          },
          {
            port: 1,
            label: 'sync',
            // audio: null,
            data: null
          },
          {
            port: 2,
            label: 'mod-A',
            // audio: null,
            data: null
          }
        ],

        outlets: [
          {
            port: 0,
            label: 'output',
            // audio: null,
            data: null
          }
        ]
      };
    },

    created() {
      const gain = this.context.createGain();    // NOTE: this is how we control the depth of the modulation (ie. in the _receiving_ module rather than the source)
      const osc = this.context.createOscillator();

      this.inlets[0].data = gain;
      this.outlets[0].data = osc;

      gain.connect(osc.frequency);      // input connects to audioParam (freq) "mod"

      osc.type = this.type;
      osc.frequency.value = this.freq;
      osc.start();

      this.$watch('freq', this.setFreq);
      this.$watch('mod', this.setGain);
      this.$watch('type', this.setType);
    },

    methods: {
      setFreq(f) {
        /**
         * k-rate control of the Oscillator frequency
         * @param  {Float} f frequency
         */

        // this.node.frequency.value = f;
        this.outlets[0].data.frequency.value = f;
      },

      setType(t) {
        /**
         * Update wave type
         * @param  {String} t One of the pre-defined oscillator wave types
         */
        // this.node.type = t;
        this.outlets[0].data.type = t;
      },

      setGain(g) {
        /**
         * Update Oscillator gain
         * @param  {Float} g  Gain, between 0 and 1.
         */
        // this.gain.gain.value = g;
        this.inlets[0].data.gain.value = g;
      }

      // createOscillator() {
      //   // NOTE: here we "recreate" an oscillator every. single. time. the audio
      //   // is toggle on / off.  They're cheap. However, this makes (re) routing
      //   // the connections a pain.
      //
      //   // INSTEAD, let's just create the audio node _once_ and its connections
      //   // _once_ as well, and when we wish to start / stop the audio, we instead
      //   // disconnect the connection between MasterOut and the audio context
      //   // destination.
      //
      //   // Chrome (in informal testing) is smart enough to know when there is no
      //   // audio chain of connected nodes, and optimizes accordingly.
      //
      //   // To wit: create the audio node and it's connection _once_, remove start /
      //   // stop listeners, and manage audio on / off in Master Out.
      //
      //   this.outlets[0].data = this.context.createOscillator();
      //   this.inlets[0].data.connect(this.outlets[0].data.frequency);      // input connects to audioParam (freq) "mod"
      //   this.node = this.outlets[0].data;
      //
      //   this.node.type = this.type;
      //   this.node.frequency.value = this.freq;
      // }

      // start() {
      //   this.createOscillator();           // create a new OSC every time. They're cheap.
      //   this.node.start();
      // },
      //
      // stop() {
      //   this.node.stop();
      // }
    }
  };
</script>

<style lang="scss">
  .slider { float: right; }
  .oscillator {
    // background: linear-gradient(to bottom, #f3eeee, #dbd7d6);
  }
</style>
