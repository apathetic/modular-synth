<template>
  <div class="note-in">
    <div class="module-details">
      <h3>NoteIn</h3>
    </div>

    <div class="module-interface">
      <span class="received" :class="{active: active}"></span>

      <p>note: {{ noteName }}</p>
      <p>freq: {{ Math.round(freq) }} Hz</p>
      <p>vel:  {{ velocity }}</p>
      <p>bend: {{ bend }}</p>
      <p>mod:  {{ mod }}</p>
    </div>

    <div class="module-connections">
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script>
  import { EVENT } from '@/events';
  import { useEventBus } from '@/composables';

  const noteNames = [];
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let i = 0; i < 127; i++) {
    let key = notes[i % 12] + '-';
    const octave = ((i / 12) | 0) - 1; // MIDI scale starts at octave = -1

    key += octave;
    noteNames[i] = key;
  }

  export default {
    props: {
      id: null
    },

    computed: {
      noteName() {
        return noteNames[this.note] || '';
      }
    },

    data() {
      return {
        name: 'NoteIn',
        active: 0,
        note: 0,
        freq: 0,
        velocity: 0,
        mod: 0,
        bend: 0,
        outlets: [
          { label: 'freq' },
          // { label: 'gate' },
          { label: 'vel' },
          { label: 'bend' },
          { label: 'mod' }
        ]
      };
    },

    created() {
      console.warn('YOU STILL NEED T DO HIS');

      const bus = useEventBus('midi');

      const unsubscribe = bus.on((event, ...payload) => {
        console.log(`news: ${event}`, payload);
      });

      // this.$bus.$on(EVENT.MIDI_NOTEON, this.noteOn);
      // this.$bus.$on(EVENT.MIDI_NOTEOFF, this.noteOff);
      // this.$bus.$on(EVENT.MIDI_CONTROLLER, this.controller);
      // this.$bus.$on(EVENT.MIDI_PITCH, this.pitchWheel);
      // this.$bus.$on(EVENT.MIDI_POLY, this.polyPressure);

      this.outlets[0].data = 'freq';      // "string" of the property to connect
      this.outlets[1].data = 'velocity';  // for now. should be "gate" or "trigger"...
      this.outlets[2].data = 'bend';
      this.outlets[3].data = 'mod';


      // navigator.serviceWorker.register('service-worker.js', {
      //   scope: './'
      // }).then(function(reg) {
      //   console.log('ServiceWorker registered', reg);
      // });

      // // ONE WAY COMMUNICATION
      // if (navigator.serviceWorker.controller) {
      //   console.log('Sending message to service worker');
      //   navigator.serviceWorker.controller.postMessage({
      //     'command': 'oneWayCommunication',
      //     'message': 'Hi, SW'
      //   });
      // }


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
    },

    destroyed() {
      this.$bus.$off(EVENT.MIDI_NOTEON, this.noteOn);
      this.$bus.$off(EVENT.MIDI_NOTEOFF, this.noteOff);
      this.$bus.$off(EVENT.MIDI_CONTROLLER, this.controller);
      this.$bus.$off(EVENT.MIDI_PITCH, this.pitchWheel);
      this.$bus.$off(EVENT.MIDI_POLY, this.polyPressure);

      window.removeEventListener(EVENT.KEY_DOWN, this.keydown);
      window.removeEventListener(EVENT.KEY_UP, this.keyup);
    },

    methods: {
      /**
       * [noteOn description]
       * @param  {[type]} note     Midi note.
       * @param  {[type]} velocity Midi velocity beteen 1 - 127.
       */
      noteOn(note, velocity) {
        this.note = note;
        this.velocity = (velocity / 127.0).toFixed(3);
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

      pitchWheel(bend) {
        this.bend = +bend.toFixed(3);
      },

      controller(target, val) {
        this.mod = (val / 127.0).toFixed(3);
      },

      // polyPressure(note, pressure) {

      // }
    }
  };
</script>

<style lang="scss">
  // @import 'styles/variables.scss';
  .note-in {
    .received {
      display: block;
      border-radius: 1em;
      width: 2em;
      height: 2em;
      background: var(--color-grey-medium);

      &.active {
        background: var(--color-green);
      }
    }
  }
</style>
