<template>
  <div
  class="note-in module"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
    </div>

    <div class="module-connections">
      <partial name="outlets"></partial>
    </div>
</template>


<script>
import { draggable } from '../mixins/draggable';
// import { newConnection } from '../store/actions';
import { rackWidth, rackHeight } from '../dimensions';

export default {
  mixins: [draggable],
  computed: {
    position() {
      return {
        left: (this.$store.state.editing || this.dragging) ? this.x + 'px' : this.col * rackWidth + 'px',
        top: (this.$store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
      };
    }
  },
  data() {
    return {
      name: 'NoteIn',
      outlets: [
        {
          port: 0,
          label: 'output',
          // audio: null,   ~
          // control: null  -
          data: null
        }
      ]
    };
  },

  ready() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'A':
          this.noteOn(63, 127);
          break;
        default:
          break;
      }
    });
  },

  methods: {

    midiMessageReceived(event) {
      const cmd = event.data[0] >> 4;
      const channel = event.data[0] & 0xf;
      const noteNumber = event.data[1];
      const velocity = event.data[2];

      if (channel === 9) { return; }

      if (cmd === 8 || (cmd === 9 && velocity === 0)) { // with MIDI, note on with velocity zero is the same as note off
        this.noteOff(noteNumber);
      } else if (cmd === 9) {
        this.noteOn(noteNumber, velocity / 127.0);
      } else if (cmd === 11) {
        this.controller(noteNumber, velocity / 127.0);
      } else if (cmd === 14) {
        this.pitchWheel(((velocity * 128.0 + noteNumber) - 8192) / 8192.0);
      } else if (cmd === 10) {  // poly aftertouch
        this.polyPressure(noteNumber, velocity / 127);
      } else {
        console.log(event.data[0] + ' ' + event.data[1] + ' ' + event.data[2]);
      }
    },

    noteOn() {},
    noteOff(note) {},
    controller() {},
    polyPressure() {}
  }
};

</script>


<style lang="scss">
</style>
