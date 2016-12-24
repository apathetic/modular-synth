<template>
  <div
    class="math multiply module"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <h3>multiply</h3>
    </div>

    <div class="module-connections">
      <partial name="inlets"></partial>
      <partial name="outlets"></partial>
    </div>
  </div>
</template>

<script>
import { draggable } from '../../mixins/draggable';
import { newConnection } from '../../store/actions';

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
        left: this.x + 'px',
        top: this.y + 'px'
      };
    }
  },
  data() {
    return {
      name: 'Multiply',
      w: 0, // 0 means it _does not appear in the rack_
      h: 0,
      inlets: [
        {
          port: 0,
          label: 'in 1',
          data: null
        },
        {
          port: 0,
          label: 'in 2',
          data: null
        }
      ],
      outlets: [
        {
          port: 0,
          label: 'out',
          data: null
        }
      ]
    };
  },

  mounted() {
    this.inlets[0].data = this.context.createGain();
    this.inlets[1].data = this.context.createGain();
    this.outlets[0].data = this.context.createGain();

    this.inlets[0].data.connect(this.outlets[0].data);
    this.inlets[1].data.connect(this.outlets[0].data.gain);
  }
};
</script>
