<template>
  <select class="select" @mousedown.stop v-model="type">
    <option v-for="type in types" :value="type">{{ type }}</option>
  </select>
</template>


<script>
import { parameter } from '../../mixins/parameter';

export default {
  mixins: [parameter],

  data() {
    return {
      step: 1,
      type: 'Slider'
    };
  },

  computed: {
    bottom() { return 'bottom:' + this.internalValue * 100 + '%'; }
  }
};

</script>


<style lang="scss">
  .slider {
    background: #444;
    border-radius: 4px;
    height: 48px;
    width: 10px;
    cursor: ns-resize;
    overflow: hidden;

    .fill {
      opacity: 0.38;
      background-color: rgb(213, 45, 255);
      position: absolute;
      height: 100%;
      width: 100%;
      transform: translateY(100%);
    }
  }

</style>
