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
          label: 'pitch'
        },
        {
          label: 'pitch'
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

    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'A':
          this.noteOn(63, 127);
          break;
        case 'S':
          this.noteOn(65, 127);
          break;
        case 'D':
          this.noteOn(66, 127);
          break;
        case 'F':
          this.noteOn(68, 127);
          break;

        default:
          break;
      }
    });
  },

  methods: {
    noteOn(note, velocity) {
      console.log('note in:', note, velocity);
    },
    noteOff(note) {},
    controller(note, velocity) {},
    pitchWheel(data) {},
    polyPressure(note, velocity) {}
  }
};
</script>
