<template>
  <div
      class="module"
      :class="[width, tall, isDragging ? 'dragging' : '']"
      :style="position"
      @mousedown.stop="startDragging">

    <component
      :is="module.type"
      :id="module.id">
    </component>

  </div>
</template>

<script>
  // TODO ---------
  // make into a functional component
  // https://vuejs.org/v2/guide/render-function.html#Functional-Components
  // -------------------

  import { draggable } from '@/mixins/draggable';
  import { context } from '@/audio';
  import { moduleSize } from '@/constants';

  import Analyser from '@/components/Analyser';
  import Comb from '@/components/Comb';
  import Compressor from '@/components/Compressor';
  import Delay from '@/components/Delay';
  import Drive from '@/components/Drive';
  import Env from '@/components/Env';
  import LFO from '@/components/LFO';
  import Mixer from '@/components/Mixer';
  import NoteIn from '@/components/NoteIn';
  import OSC from '@/components/OSC';
  import Reverb from '@/components/Reverb';
  import VCF from '@/components/Filter';
  import VCO from '@/components/VCO';
  import VCA from '@/components/VCA';

  import Debugger from '@/components/test/Debugger';
  import Node from '@/components/test/Node';

  export default {
    mixins: [ draggable ],
    provide: [ context ],
    components: {
      Analyser,
      Comb,
      Compressor,
      Debugger,
      Delay,
      Drive,
      Env,
      LFO,
      Mixer,
      Node,
      NoteIn,
      OSC,
      Reverb,
      VCF,
      VCO,
      VCA
    },

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
