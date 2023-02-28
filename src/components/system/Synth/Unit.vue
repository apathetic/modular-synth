// TODO: could this be <Module />?
<template>
  <div
    class="module"
    ref="el"
    :class="[width, tall, { dragging: isDragging }, { active: isActive }]"
    :style="position"
    @mousedown.stop="(e) => startDragging(e, el)"
  >

    <!-- @mouseover.stop="setFocus(module.id)"
    @mouseout.stop="clearFocus()" -->


    <!-- <div class="module-interface"> -->
      <component
        ref="node"
        :is="module.type"
        :id="module.id"
      />

    <!-- </div> -->

    <!-- <div class="module-connections"> -->
      <!-- <slot #inlets></slot> -->
      <!-- <slot #outlets></slot> -->
    <!-- </div> -->
  </div>
</template>


<script>
  import { defineComponent, computed, ref, watch, onMounted, onUnmounted, onErrorCaptured } from 'vue';
  import * as Modules from '@/components/';
  import Debugger from '@/components/test/Debugger.vue';
  import { rackWidth, rackHeight, moduleSize } from '@/constants';
  import { useAppStore } from '@/stores/app';
  import { useDraggable } from '@/composables';
  // import { context } from '@/audio';

  export default defineComponent({
    name: 'Unit',

    components: {
      ...Modules,
      Debugger
    },

    props: {
      module: {
        type: Object, // as Module
        required: true
      }
    },

    setup (props) {

      // eslint-disable-next-line vue/no-setup-props-destructure
      const { type, id } = props.module;
      const { coords, startDragging, isDragging } = useDraggable(props.module);
      const store = useAppStore();

      const el = ref(undefined); // this'll be a ref to the DOM node
      const node = ref(null); // this'll be a ref to the instantiated audio node

      const isActive = computed(() => id == store.activeId);
      const position = computed(() => store.isEditing || isDragging.value ?
        {
          left: coords.x + 'px',
          top: coords.y + 'px'
        } : {
          left: props.module.col * rackWidth + 'px',
          top: props.module.row * rackHeight + 'px'
        }
      );

      // doenst need 2 b reactive:
      const width = `_${moduleSize[type][0]}U`;
      const tall = moduleSize[type][2] ? 'module--tall' : '';

      // watch(() => store.isEditing || isDragging, (after, before) => {
      //   ...state change...
      // });

      // watch(node, (newValue) => {
      //   ...state change...
      // }, { deep: true });


      onMounted(() => {
        // `modules` are already tracked... but they're JSON.
        // We want to track all INSTANTIATED web audio nodes
        // This is possible only after the module has rendered
        store.addToRegistry({ id, node: node.value, coords });
      });

      onUnmounted(() => {
        console.log('Destroying %s ', type);
        store.removeFromRegistry(id);
      });

      onErrorCaptured((e) => {
        console.log('is this an error boundary?', e);
      });


      console.log('%c[component] Creating %s', 'color: green', type);

      return {
        el,
        node,
        width,
        tall,
        startDragging,
        isDragging,
        isActive,
        position,

        // setFocus, clearFocus
      };
    }
  });
</script>

