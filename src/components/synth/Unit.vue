<script lang="ts">
  import { defineComponent, computed, ref, onMounted, onBeforeUnmount, onErrorCaptured } from 'vue';
  import { rackWidth, rackHeight, moduleSize } from '@/constants';
  import { useDraggable, provideModuleId } from '@/composables';
  import { useAppStore } from '@/stores/app';
  import { registry } from '@/audio/registry';
  import { MASTER_ID } from '@/audio/master';
  import { log } from '@/utils/logger';
  import { modules } from '@/components';
  import Debugger from '@/components/modules/Debugger.vue';
  import type { Module } from '@/types/generated';
  import type { SynthNode } from '@/types/globals';
  import type { PropType } from 'vue'

  export default defineComponent({
    name: 'Unit',

    components: {
      ...modules,
      Debugger
    },

    props: {
      module: {
        type: Object as PropType<Module>,
        required: true,
      },
    },

    setup (props) {
      const { type, id } = props.module; // note: we destructure here b/c we don't care about reactivity

      if (id === MASTER_ID || type === 'MasterOut') { throw new Error('<Unit> cannot render MasterOut'); }

      provideModuleId(id);

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
        if (node.value) {
          registry.add(id, node.value as SynthNode);
        }
      });

      onBeforeUnmount(() => {
        log({ type:'component', action:'destroying', data:type });
        registry.remove(id);
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

<template>
  <div
    class="module"
    ref="el"
    :class="[width, tall, { dragging: isDragging }, { active: isActive }]"
    :style="position"
    @mousedown.stop="(e) => startDragging(e, el)"
  >
    <component
      ref="node"
      :is="module.type"
      :id="module.id"
    />
  </div>
</template>


<!--
  Unit owns the `.module` wrapper chrome used by every rack module. Styles
  are intentionally NOT scoped: the nested `.module-details` /
  `.module-interface` / `.module-connections` markup is emitted by each
  module component (OSC, VCA, Filter, ...) and needs to inherit these
  rules without a data-v-* attribute collision.
-->
<style>
  /* --------------------------------
    Module
  --------------------------------- */

  .module {
    height: var(--cellHeight);
    width: var(--cellWidth);
    border: 1px solid var(--color-grey-dark);
    border-radius: var(--border-radius);
    position: absolute;
    transition: all var(--transition-time-slow);
    transition-timing-function: ease-in-out;
    z-index: 1;

    height: 112px; /* in `edit` mode */

    &:hover {
      filter: brightness(1.2);

      .module-details {
        color: #fff;
        text-shadow: 0 0 2px #fff, 0 0 1px #000, 0 0 1px #fff;
      }
    }

    &.dragging {
      cursor: move;
      transition: none;
      opacity: 0.8;
    }

    &.active {
      box-shadow: 0 0 0 2px greenyellow;
    }

    .inlets  { float: left; }
    .outlets { float: right; }

    .inlet {
      left: -5px;

      &::after { left: 1em; }
    }

    .outlet {
      right: -5px;

      &::after {
        right: 1em;
        text-align: right;
      }
    }

    > div {
      height: 100%;
    }
  }

  .module-details {
    background: #777;
    border-bottom: 1px solid #000;
    border-top: 1px solid #999;
    color: #000;
    position: absolute;
    width: 100%;

    h3 {
      font-weight: 700;
      padding: 0.1em 0.2em;
      margin: 0;
    }
  }

  .module-interface {
    overflow: hidden;
    padding: 36px 24px 18px;
    height: 100%;
    visibility: hidden;
    transition: visibility 0s;    /* yes you can do this (to delay the toggle of block/none) */
  }

  .module-connections {
    position: absolute;
    width: 100%;
    top: 12px;
    height: 0;

    span {
      margin: 8px 0;
      display: block;
      width: 3px;
      height: 12px;
      background: #eee;
      cursor: pointer;
      text-transform: uppercase;
      font-size: 0.75em;

      &:hover {
        background: orange;
      }

      &::after {
        content: attr(data-label);
        width: 5em;
        position: absolute;
        text-transform: uppercase;
        line-height: 1.6;
      }
    }
  }

  /* --------------------------------
    Play mode overrides
  --------------------------------- */

  .play-mode .module {
    width: calc(var(--rackWidth) * 3);   /* default rack width is 3U */
    height: var(--rackHeight);

    &.h\:1U { height: calc(var(--rackHeight) * 1); }
    &.h\:2U { height: calc(var(--rackHeight) * 2); }

    &.w\:1U { width: calc(var(--rackWidth) * 1); }
    &.w\:2U { width: calc(var(--rackWidth) * 2); }
    &.w\:3U { width: calc(var(--rackWidth) * 3); }
    &.w\:4U { width: calc(var(--rackWidth) * 4); }
    &.w\:6U { width: calc(var(--rackWidth) * 6); }
  }

  .play-mode .module-interface {
    display: block;
    visibility: visible;
    transition-delay: var(--transition-time-slow);
  }

  .play-mode .module-connections {
    display: none;
  }
</style>
