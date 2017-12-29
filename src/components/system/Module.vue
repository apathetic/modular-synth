<template>
  <div
    class="module _4U">
    :class="[name, '_' + width, {dragging: dragging}]"
    :style="position"
    @mousedown.stop="startDragging"

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <slot></slot>
    </div>

    <div class="module-connections">
      <inlets  :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
  </div>
</template>

<script>
  // import { draggable } from '@/mixins/draggable';

  export default {
    // mixins: [draggable],
    props: {
      name: 'module'
      // col: 0,
      // row: 0,
      // inlets: [],
      // outlets: [],
      // width: 2
    },

    created() {
      console.log('dddd', this.coords);
      console.log('%c[component] Creating %s', 'color: blue', this.name);
      console.log(this.name, this.col, this.coords, this.width);
    },

    destroyed() {
      console.log('Destroying %s ', this.name);
    }
  };
</script>
