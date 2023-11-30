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


<script lang="ts">
  import { defineComponent, computed, ref, onMounted, onBeforeUnmount, onErrorCaptured } from 'vue';
  import { rackWidth, rackHeight, moduleSize } from '@/constants';
  import { useDraggable } from '@/composables';
  import { useAppStore } from '@/stores/app';
  import { log } from '@/utils/logger';
  import * as Modules from '@/components/';
  import Debugger from '@/components/modules/Debugger.vue';
  import type { Module } from '@/types';
  import type { PropType } from 'vue'

  export default defineComponent({
    name: 'Unit',

    components: {
      ...Modules,
      Debugger
    },

    props: {
      module: {
        type: Object as PropType<Module>,
        required: true,
      },
    },

    setup (props) {
      // eslint-disable-next-line vue/no-setup-props-destructure
      const { type, id } = props.module;
      // const { type: t, id } = props.module;
      const { coords, startDragging, isDragging } = useDraggable(props.module);
      const store = useAppStore();

      const el = ref(undefined); // this'll be a ref to the DOM node
      const node = ref(null);    // this'll be a ref to the instantiated audio node

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
      // const width = `_${moduleSize[type][0]}U`;
      // const tall = moduleSize[type][2] ? 'module--tall' : '';
      const width = `w:${moduleSize[type][0]}U`;
      const tall = `h:${moduleSize[type][1]}U`;


      onMounted(() => {
        // `modules` are already tracked... but they're JSON.
        // We want to track all INSTANTIATED web audio nodes
        // This is possible only after the module has rendered
        store.addToRegistry({ id, node: node.value });
      });

      onBeforeUnmount(() => {
        // console.log('Destroying %s ', type);
        log({ type:'params', action:'destroying', data:type });
        store.removeFromRegistry(id);
      });

      onErrorCaptured((e) => {
        console.log('is this an error boundary?', e);
      });


      log({ type:'component', action:'creating', data:type });


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

