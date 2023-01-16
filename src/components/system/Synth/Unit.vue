// TODO: could this be <Module />?
<template>
  <div
    class="module"
    ref="el"
    :class="[width, tall, isDragging ? 'dragging' : '']"
    :style="position"
    @mousedown.stop="(e) => drag(e, $refs.el)"
  >

    <!-- <div class="module-interface"> -->
      <slot></slot>
    <!-- </div> -->

    <!-- <div class="module-connections"> -->
      <!-- <slot #inlets></slot> -->
      <!-- <slot #outlets></slot> -->
    <!-- </div> -->
  </div>
</template>

<script>
  import { defineComponent, computed, ref, reactive, onMounted } from 'vue';
  import { mapState, mapActions } from 'pinia';
  import { useAppStore } from '@/stores/app';
  import { useDraggable } from '@/composables';
  // import { context } from '@/audio';
  import { rackWidth, rackHeight, moduleSize } from '@/constants';

  export default defineComponent({

    props: {
      module: {
        type: Object, // as Module
        required: true
      }
    },

    setup (props, { slots, emit }) {
      // const { isEditing } = useAppStore();
      const store = useAppStore();
      const { coords, startDragging, isDragging } = useDraggable(props.module);

      const el = ref(undefined); // hopefully this'll be to the DOM node
      // const id = ref(props.module.id); // this is the ID used by the Connector to route audio
      const x = ref(props.module.x);
      const y = ref(props.module.y);

      // const isEditing = computed(() => store.isEditing);
      // const isDragging = computed(() => draggable.isDragging);
      // const coords = computed(() => draggable.coords);
      const showDrag = computed(() => store.isEditing || isDragging);
      const position = computed(() => {
        console.log(coords, props.module);

        return (showDrag.value) ? {
          left: coords.x + 'px',
          top: coords.y + 'px'
        } : {
          left: props.module.col * rackWidth + 'px',
          top: props.module.row * rackHeight + 'px'
        };
      });

      // doenst need 2 b reactive:
      // const width() {
      //   return `_${moduleSize[this.module.type][0]}U`;
      // }
      // tall() {
      //   return moduleSize[this.module.type][2] ? 'module--tall' : '';

      const width = `_${moduleSize[props.module.type][0]}U`;
      const tall = moduleSize[props.module.type][2] ? 'module--tall' : '';

      function drag(e) { startDragging(e, el.value); }



      // or, maybe better: add node to this.node...?
      // note that modules are already tracked... but they're JSON
      // we want to track the INSTANTIATED web audio nodes.
      // [TODO] see ToneJS or something...

      console.warn('dont forget to active this');
      // this.$store.commit('ADD_TO_REGISTRY', {
      //   id: this.id,
      //   node: this.$children[0], // this.$slots.default
      // });
      store.addToRegistry({
        id: props.module.id,
        node: slots.default // this.$children[0], //
      });

      console.log('%c[component] Creating %s', 'color: green', props.module.type);


      function onUnmounted() {
        console.log('Destroying %s ', this.module.type);
        this.$store.commit('REMOVE_FROM_REGISTRY', this.id);
      }

      return {
        el,
        width,
        tall,
        isDragging,
        position,
        drag,
        showDrag
      };
    }
  });
</script>
