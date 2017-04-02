<template>
  <div
  class="note-in module _2U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      notein: {{ received }}
    </div>

    <div class="module-connections">
      <outlets :ports="outlets"></outlets>
    </div>
</template>

<script>
import { signal } from '../audio';
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
      name: 'NoteIn',
      received: '',
      outlets: [
        {
          label: 'pitch',
          data: 0
        },
        {
          label: 'gate',
          data: 0
        },
        {
          label: 'bend',
          data: 0
        }
      ]
    };
  },

  created() {
    this.$bus.$on('midi:noteOn', this.noteOn);
    this.$bus.$on('midi:noteOff', this.noteOff);
    this.$bus.$on('midi:controller', this.controller);
    this.$bus.$on('midi:pitchWheel', this.pitchWheel);
    this.$bus.$on('midi:polyPressure', this.polyPressure);

    // this.outlets[0].data = null;

    window.addEventListener('keydown', (e) => {
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

        default:
          break;
      }
    });

    console.log('Creating NoteIn');
  },

  methods: {
    noteOn(note, velocity) {
      console.log('note in:', note, velocity);
      this.outlets[0].data = note;
      this.outlets[1].data = velocity;
    },
    noteOff(note) {
      console.log('note off:', note);
      // this.outlets[0].data = note;
      this.outlets[1].data = 0;
    },
    controller(note, velocity) {},
    pitchWheel(data) {},
    polyPressure(note, velocity) {}
  }
};
</script>
