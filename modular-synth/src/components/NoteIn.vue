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
      <outlets ports="outlets"></outlets>
    </div>
</template>


<script>
import { draggable } from '../mixins/draggable';
import { newConnection } from '../store/actions';
import { rackWidth, rackHeight } from '../dimensions';

export default {
  mixins: [draggable],
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
        left: (this.$store.state.editing || this.dragging) ? this.x + 'px' : this.col * rackWidth + 'px',
        top: (this.$store.state.editing || this.dragging) ? this.y + 'px' : this.row * rackHeight + 'px'
      };
    }
  },
  data() {
    return {
      name: 'NoteIn',
      received: '',
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

  mounted() {
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
