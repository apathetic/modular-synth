// TODO: could this be a renderless component?
<template>
  <div
    class="module"
    :class="[width, tall, isDragging ? 'dragging' : '']"
    :style="position"
    @mousedown.stop="startDragging"
  >
    <slot></slot>
  </div>
</template>

<script>
  import { draggable } from '@/mixins/draggable';
  import { context } from '@/audio';
  import { moduleSize } from '@/constants';

  export default {
    mixins: [ draggable ],
    props: {
      module: Object
    },

    computed: {
      width() {
        return `_${moduleSize[this.module.type][0]}U`;
      },
      tall() {
        return moduleSize[this.module.type][2] ? 'module--tall' : '';
      }
    },

    created() {
      this.id = this.module.id; // NOTE: this is the ID used by the Connector to route audio

      console.log('%c[component] Creating %s', 'color: green', this.module.type);
    },

    destroyed() {
      console.log('Destroying %s ', this.module.type);
    }
  };
</script>
