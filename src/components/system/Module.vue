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
  import { moduleSize } from '@/constants';

  import Analyser from '@/components/Analyser';
  import Comb from '../Comb';
  import Compressor from '../Compressor';
  import Delay from '../Delay';
  import Drive from '../Drive';
  import Env from '../Env';
  import LFO from '../LFO';
  import Mixer from '../Mixer';
  import NoteIn from '../NoteIn';
  import OSC from '../OSC';
  import Reverb from '../Reverb';
  import VCF from '../Filter';
  import VCO from '../VCO';
  import VCA from '../VCA';

  import Debugger from '../test/Debugger';
  import Node from '../test/Node';

  // import context from '../../audio';

  export default {
    name: 'Module',

    mixins: [draggable],
    // inject: [ context ],
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
