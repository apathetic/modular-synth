<template>
  <div
  class="note-in module module--tall _2U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      notein: {{ received }}
      <span class="xxx" :class="{active: active}"></span>

      <br><br>{{ note }}<br>{{ velocity }}
    </div>

    <div class="module-connections">
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
// import { signal } from '../audio';
import { draggable } from '../mixins/draggable';
import { EVENT } from '../events';

export default {
  mixins: [draggable],
  props: {
    id: null,
    col: null,
    row: null
  },

  data() {
    return {
      name: 'NoteIn',
      received: '',
      active: 0,
      note: 0,
      freq: 0,
      velocity: 0,
      touch: 0,
      outlets: [
        { label: 'freq' },
        { label: 'gate' },
        { label: 'vel' },
        { label: 'touch' }
      ]
    };
  },

  created() {
    this.$bus.$on(EVENT.MIDI_NOTEON, this.noteOn);
    this.$bus.$on(EVENT.MIDI_NOTEOFF, this.noteOff);
    this.$bus.$on(EVENT.MIDI_CONTROLLER, this.controller);
    this.$bus.$on(EVENT.MIDI_PITCH, this.pitchWheel);
    this.$bus.$on(EVENT.MIDI_POLY, this.polyPressure);

    this.outlets[0].data = 'freq';      // "string" of the property to connect
    this.outlets[1].data = 'velocity';  // for now. should be "gate" or "trigger"...
    this.outlets[2].data = 'velocity';
    this.outlets[3].data = 'touch';


    // navigator.serviceWorker.register('service-worker.js', {
    //   scope: './'
    // }).then(function(reg) {
    //   console.log('ServiceWorker registered', reg);
    // });


    this.keydown = (e) => {
      switch (e.code) {
        case 'KeyA':
          this.noteOn(63, 127);
          break;
        case 'KeyS':
          this.noteOn(65, 127);
          break;
        case 'KeyD':
          this.noteOn(66, 127);
          break;
        case 'KeyF':
          this.noteOn(68, 127);
          break;
        case 'KeyG':
          this.noteOn(70, 127);
          break;

        default:

          // ONE WAY COMMUNICATION
          if (navigator.serviceWorker.controller) {
            console.log('Sending message to service worker');
            navigator.serviceWorker.controller.postMessage({
              'command': 'oneWayCommunication',
              'message': 'Hi, SW'
            });
          }

          break;
      }
    };

    this.keyup = (e) => {
      switch (e.code) {
        case 'KeyA':
          this.noteOff(63);
          break;
        case 'KeyS':
          this.noteOff(65);
          break;
        case 'KeyD':
          this.noteOff(66);
          break;
        case 'KeyF':
          this.noteOff(68);
          break;
        case 'KeyG':
          this.noteOff(70);
          break;

        default:
          break;
      }
    };

    window.addEventListener(EVENT.KEY_DOWN, this.keydown);
    window.addEventListener(EVENT.KEY_UP, this.keyup);

    console.log('%c[component] Creating NoteIn', 'color: blue');
  },

  destroyed() {
    this.$bus.$off(EVENT.MIDI_NOTEON, this.noteOn);
    this.$bus.$off(EVENT.MIDI_NOTEOFF, this.noteOff);
    this.$bus.$off('midi:controller', this.controller);
    this.$bus.$off('midi:pitchWheel', this.pitchWheel);
    this.$bus.$off('midi:polyPressure', this.polyPressure);

    window.removeEventListener(EVENT.KEY_DOWN, this.keydown);
    window.removeEventListener(EVENT.KEY_UP, this.keyup);

    console.log('Destroying NoteIn');
  },

  methods: {
    noteOn(note, velocity) {
      this.note = note;
      this.velocity = velocity;
      this.freq = 440 * (Math.pow(2, ((note - 69) / 12)));
      this.active = note;
    },

    noteOff(note) {
      this.note = note;

      if (note === this.active) {
        this.active = 0;
        this.velocity = 0;
      }
    },

    controller(note, velocity) {},
    pitchWheel(data) {},
    polyPressure(note, pressure) {

    }
  }
};
</script>

<style lang="scss">
  @import '../assets/scss/variables.scss';

  .note-in {
    .xxx {
      display: block;
      border-radius: 1em;
      width: 2em;
      height: 2em;
      background: $color-grey-medium;

      &.active {
        background: $color-green;
      }
    }
  }
</style>
