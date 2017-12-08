<template>
  <div
    class="oscillator module _4U"
    :class="dragging ? 'dragging' : ''"
    :style="position"
    @mousedown.stop="startDragging">

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
  import { draggable } from '@/mixins/draggable';

  export default {
    mixins: [draggable],
    props: {
      col: 0,
      row: 0,
      name: 'module',
      inlets: [],
      outlets: [],
      width: null
    },

    created() {
      console.log('%c[component] Creating VCO', 'color: blue');
    },

    destroyed() {
      console.log('Destroying VCO ', this.id);
    }
  };
</script>

<style lang="scss">
  @import '../../assets/scss/variables.scss';
</style>
