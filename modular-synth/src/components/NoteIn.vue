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
      <span class="xxx" :class="{active: active}"></span>

      <br><br>{{ note }}<br>{{ velocity }}
    </div>

    <div class="module-connections">
      <outlets :ports="outlets"></outlets>
    </div>
</template>

<script>
// import { signal } from '../audio';
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
      active: 0,
      note: 0,
      velocity: 0,
      outlets: [
        {
          label: 'pitch',
          data: 0
        },
        {
          label: 'gate'
        },
        {
          label: 'bend'
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

    this.outlets[0].data = 'note';  // string of the value to connect
    this.outlets[1].data = 'velocity';

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

    window.addEventListener('keyup', (e) => {
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

        default:
          break;
      }
    });

    console.log('Creating NoteIn');
  },

  methods: {
    noteOn(note, velocity) {
      // this.outlets[0].data = note;
      // this.outlets[1].data = velocity;
      this.note = note;
      this.velocity = velocity;

      this.active = note;
    },
    noteOff(note) {
      // this.outlets[0].data = note;
      // this.outlets[1].data = 0;
      this.note = note;

      if (note === this.active) {
        this.active = 0;
        this.velocity = 0;
      }
    },
    controller(note, velocity) {},
    pitchWheel(data) {},
    polyPressure(note, velocity) {}
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
