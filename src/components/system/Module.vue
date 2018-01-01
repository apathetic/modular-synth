<template>
  <div
      class="module"
      :class="[width, isDragging ? 'dragging' : '']"
      :style="position"
      @mousedown.stop="startDragging">

    <component
      :is="module.type"
      :id="module.id">
    </component>

  </div>
</template>

<script>
  import { draggable } from '@/mixins/draggable2';
  import { moduleSize } from '../../dimensions';

  import Analyser from '../Analyser';
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

  import Debugger from '../Debugger';
  import Node from '../Node';

  export default {
    mixins: [draggable],
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

    created() {
      this.id = this.module.id;
      this.width = `_${moduleSize[this.module.type][0]}U`;

      console.log('%c[component] Creating %s', 'color: blue', this.module.type);
    },

    destroyed() {
      console.log('Destroying %s ', this.module.type);
    }
  };
</script>
