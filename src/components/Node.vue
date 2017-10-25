<template>
  <div
  class="node module _4U"
  :class="dragging ? 'dragging' : ''"
  :style="position"
  @mousedown.stop="startDragging">

    <div class="module-details">
      <h3>{{ name }}</h3>
    </div>

    <div class="module-interface">
      <slot name="interface"></slot>
      {{ position }}<br><br>
      x {{ x }}<br>
      y {{ y }}<br>
      col {{ col }}<br>
      row {{ row }}<br>
      {{ position.left }}<br>
      {{ dragging }}<br>
      edit: {{ $store.state.editing }}
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
      <outlets :ports="outlets"></outlets>
    </div>
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
        name: 'Node',
        inlets: [
          {
            label: 'freq'
            // audio: null // this.input
          },
          {
            label: 'gain'
            // audio: null // this.input
          },
          {
            label: 'range'
            // audio: null // this.input
          }
        ],

        outlets: [
          {
            label: 'output-1'
            // audio: null // this.outputL   // src?
          },
          {
            // port: 1,
            label: 'output-2'
            // audio: null // this.outputR
          }
        ]
      };
    },

    created() {
      // dummy outlet for test
      this.inlets[0].audio = this.context.createGain();

      this.outlets[0].audio = this.context.createGain();
      this.outlets[1].audio = this.context.createGain();

      console.log('%c[component] Creating Node', 'color: blue');
    }

    // destroyed() {
    //   this.inlets[0].audio.disconnect();
    //   this.outlets[0].audio.disconnect();
    //   this.outlets[1].audio.disconnect();
    // }
  };

</script>

<style lang="scss">
  $grey: #a8a8a8;
  $teal: #409d9e;
  .node {
    background-image: radial-gradient(
      circle,
      $grey 0%,
      $grey  10%,
      $teal 10%,
      $teal 26%,
      $grey  26%,
      $grey  28%,
      $teal 28%,
      $teal 36%,
      $grey  36%,
      $grey  40%,
      $teal 40%,
      $teal 44%,
      $grey  44%,
      $grey  52%,
      $teal 52%,
      $teal 54%,
      $grey  54%,
      $grey  100%
     );
     background-position: 100% 66%;
     background-size: 150%;
  };
</style>
