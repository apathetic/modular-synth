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
  import Knob from './UI/Knob';
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
            label: 'freq',
            data: null
          },
          {
            port: 1,
            label: 'sync',
            data: null
          },
          {
            port: 2,
            label: 'mod-A',
            data: null
          }
        ],

        outlets: [
          {
            port: 0,
            label: 'output',
            data: null
          }
        ]
      };
    },

    created() {
      // this.inlets[0].data = this.context.createGain();
      this.outlets[0].data = this.context.createGain();

      // Our lovely webAudio Oscillator.
      this.osc = this.context.createOscillator();
      this.osc.type = this.type;
      this.osc.frequency.value = this.freq;

      this.osc.connect(this.outlets[0].data);
      // or: this.outlets[0].data = this.osc; ...???

      this.inlets[0].data = this.osc.frequency;


      this.$watch('freq', this.setFreq);
      this.$watch('type', this.setType);

      this.$on('start', this.start);
      this.$on('stop', this.stop);      // BAD. CANNOT RESTART.
    },

    methods: {
      /**
       * k-rate control of the Oscillator frequency
       * @param  {Float} f frequency
       */
      setFreq(f) {
        this.osc.frequency.value = f;
      },

      /**
       * Update wave type
       * @param  {String} t One of the pre-defined oscillator wave types
       */
      setType(t) {
        this.osc.type = t;
      },

      start() {
        // this.osc = this.context.createOscillator();   // create a new OSC every time
        this.osc.start();
      },

      stop() {
        this.osc.stop();
      }
    }
  };
</script>
