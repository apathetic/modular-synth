// TODO: could this be <Module />?
<template>
  <div
    class="module"
    ref="el"
    :class="[width, tall, { dragging: isDragging }, { active: isActive }]"
    :style="position"
    @mousedown.stop="(e) => startDragging(e, el)"
  >

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
  import { defineComponent, computed, ref, watch, unref, onMounted, onUnmounted } from 'vue';
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
      // const module = ref(props.module);
      // const id = ref(props.module.id); // this is the ID used by the Connector to route audio
      // const x = ref(props.module.x);
      // const y = ref(props.module.y);
      // eslint-disable-next-line vue/no-setup-props-destructure
      const { type, id } = props.module;
      const { coords, startDragging, isDragging } = useDraggable(props.module);
      const store = useAppStore();

      const el = ref(undefined); // this'll be a ref to the DOM node
      const node = ref(null); // this'll be a ref to the instantiated audio node

      const isActive = computed(() => id == store.activeId);
      const position = computed(() => (store.isEditing || isDragging) ? {
        left: coords.x + 'px',
        top: coords.y + 'px'
      } : {
        left: props.module.col * rackWidth + 'px',
        top: props.module.row * rackHeight + 'px'
      });

      // doenst need 2 b reactive:
      const width = `_${moduleSize[type][0]}U`;
      const tall = moduleSize[type][2] ? 'module--tall' : '';

      watch(() => store.isEditing || isDragging, (after, before) => {
        console.log(unref(after), unref(before));
        console.log(unref(position));
        console.log(rackHeight, rackWidth);
        console.log(props.module.row, props.module.col);
      });

      // watch(node, (newValue) => {
      //   console.log('deep', newValue);
      // }, { deep: true });


      onMounted(() => {
        // `modules` are already tracked... but they're JSON.
        // We want to track all INSTANTIATED web audio nodes
        store.addToRegistry({ id, node: node.value, coords });
      });

      onUnmounted(() => {
        console.log('Destroying %s ', type);
        store.removeFromRegistry(id);
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
      };
    }
  });
</script>

