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
      <knob label="freq" :value.sync="freq" :min="220" :max="880"></knob>
      <knob label="sync" :value.sync="sync" :min="0"   :max="1"></knob>
      <knob label="PW"   :value.sync="PW"   :min="0"   :max="6.28"></knob>
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
  import Knob from './UI/Knob2';
  // import { node } from '../mixins/node';
  import store from '../store/store'; // .... er...


  export default {
    mixins: [draggable],
    components: { Knob },
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
          left: (store.state.editing || this.dragging) ? this.x + 'px' : this.col * rackWidth + 'px',
          top: (store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
        };
      }
    },

    data() {
      return {
        name: 'Oscillator',
        w: 1, // rack width
        h: 2, // rack height

        freq: 440,
        PW: 0,
        sync: 0,
        type: 'sine',
        types: ['sine', 'square', 'sawtooth', 'triangle'],
        inlets: [
          {
            port: 0,
            label: 'freq'
            // data: null
          },
          {
            port: 1,
            label: 'sync'
            // data: null
          },
          {
            port: 2,
            label: 'mod-A'
            // data: null
          }
        ],

        outlets: [
          {
            port: 0,
            label: 'output'
            // data: null
          }
        ]
      };
    },

    created() {
      this.gain = this.context.createGain();
      // this.outlets[0].data = this.gain;
      this.outlets[0].audio = this.gain;
      this.newOscillator();

      this.$watch('freq', this.setFreq);
      this.$watch('type', this.setType);

      this.$on('start', this.start);
      this.$on('stop', this.stop);
    },

    methods: {
      setFreq(f) {
        /**
         * k-rate control of the Oscillator frequency
         * @param  {Float} f frequency
         */
        this.node.frequency.value = f;
      },

      setType(t) {
        /**
         * Update wave type
         * @param  {String} t One of the pre-defined oscillator wave types
         */
        this.node.type = t;
      },

      setGain(g) {
        /**
         * Update Oscillator gain
         * @param  {Float} g  Gain, between 0 and 1.
         */
        this.gain.gain.value = g;
      },

      newOscillator() {
        this.node = this.context.createOscillator();
        this.node.type = this.type;
        this.node.frequency.value = this.freq;

        this.node.connect(this.gain);
      },

      start() {
        this.newOscillator();           // create a new OSC every time. They're cheap.
        this.node.start();
      },

      stop() {
        this.node.stop();
      }
    }
  };
</script>
