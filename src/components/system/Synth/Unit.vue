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

      // this.$store.commit('ADD_TO_REGISTRY', {
      //   id: this.id,
      //   node: this.$children[0], // this.$slots.default
      // });

      console.log('%c[component] Creating %s', 'color: green', this.module.type);
    },

    mounted() {
      this.$store.commit('app/ADD_TO_REGISTRY', {
        id: this.id,
        node: this.$children[0], // this.$slots.default
      });
    },

    destroyed() {
      console.log('Destroying %s ', this.module.type);
      this.$store.commit('REMOVE_FROM_REGISTRY', this.id);
    }
  };
</script>
