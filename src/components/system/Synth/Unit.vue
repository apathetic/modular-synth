// TODO: could this be <Module />?
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
  import { mapState, mapActions } from 'pinia';
  import { useAppStore } from '@/stores/app';
  import { useDraggable } from '@/composables';
  // import { context } from '@/audio';
  import { rackWidth, rackHeight, moduleSize } from '@/constants';
  // import { draggable } from '@/mixins/draggable';

  export default {
    // name: 'Module' ...?
    // mixins: [ draggable ],
    props: {
      module: {
        type: Object, // as Module
        required: true
      }
    },

    data() {
      return {
        id: this.module.id, // NOTE: this is the ID used by the Connector to route audio
        // x: 0,
        // y: 0,
        x: this.module.x,
        y: this.module.y,
        isDragging: false
      };
    },

    computed: {
      ...mapState(useAppStore, {
        // compute: (state) => state.isEditing || this.isDragging
        compute(state) { state.isEditing || this.isDragging }
      }),
      position() {
        // const compute = this.$store.getters.editing || this.isDragging;
        const { x, y, module } = this;
        console.log(x, y, module);
        return {
          left: (this.compute) ? this.x + 'px' : this.module.col * rackWidth + 'px',
          top: (this.compute) ? this.y + 'px' : this.module.row * rackHeight + 'px'
        };
      },

      width() {
        // return `_${moduleSize[this.module.type][0]}U`;
        return `_U`;
      },
      tall() {
        // if (!this.module?.type) return '';
        console.log(this.module?.type, moduleSize);
        return moduleSize[this.module.type][2] ? 'module--tall' : '';
        // return '';
      }
    },

    methods: {
      ...mapActions(useDraggable, [
        'startDragging',
      ]),
      ...mapActions(useAppStore, [
        'addToRegistry',
      ])
    },

    created() {
      // this.id = this.module.id; // NOTE: this is the ID used by the Connector to route audio
      // this.x = this.module.x;
      // this.y = this.module.y;

      console.warn('dont forget to active this');
      // this.$store.commit('ADD_TO_REGISTRY', {
      //   id: this.id,
      //   node: this.$children[0], // this.$slots.default
      // });

      console.log('%c[component] Creating %s', 'color: green', this.module.type);
    },

    mounted() {

      // or, maybe better: add node to this.node...?
      // note that modules are already tracked... but they're JSON
      // we want to track the INSTANTIATED web audio nodes.
      // [TODO] see ToneJS or something...

      // this.$store.commit('ADD_TO_REGISTRY', {
      //   id: this.id,
      //   node: this.$children[0], // this.$slots.default
      // });
      this.addToRegistry({
        id: this.id,
        node: this.$slots.default // this.$children[0], //
      });
    },

    unmounted() {
      console.log('Destroying %s ', this.module.type);
      this.$store.commit('REMOVE_FROM_REGISTRY', this.id);
    }
  };
</script>
