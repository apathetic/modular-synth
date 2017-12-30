<template>
  <div
      class="module"
      :class="[isDragging ? 'dragging' : '']"
      :style="position"
      @mousedown.stop="startDragging">

    <component
      :is="module.type"
      :id="module.id"
      :module="module">
    </component>

  </div>
</template>

<script>
  import { draggable } from '@/mixins/draggable2';
  // import { rackWidth, rackHeight } from '../../dimensions';
  // import { EVENT } from '../../events';

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
  // import VCO from '../VCO';
  import VCO from '../VCO_alt';
  import VCA from '../VCA';

  import Debugger from '../Debugger';
  import Node from '../Node';


  // const dragObj = {
  //   zIndex: 0,
  //   cursorStartX: null,
  //   cursorStartY: null,
  //   startX: null,
  //   startY: null
  // };

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

    // computed: {
    //   position() {
    //     return {
    //       left: (this.$store.state.editing || this.isDragging) ? this.x + 'px' : this.col * rackWidth + 'px',
    //       top: (this.$store.state.editing || this.isDragging) ? this.y + 'px' : this.row * rackHeight + 'px'
    //     };
    //   }
    // },

    // data() {
    //   return {
    //     // x: 0,
    //     // y: 0,
    //     isDragging: false
    //   };
    // },

    created() {
      console.log('%c[component] Creating %s', 'color: blue', this.module.type);
      // this.x = this.module.x;
      // this.y = this.module.y;
      // this.row = this.module.row;
      // this.col = this.module.col;
    }

    // methods: {
    //   startDragging(event) {
    //     const node = this.$el;
    //     const x = node.offsetLeft;  // Calculate explicity because could be in play mode, in which ...
    //     const y = node.offsetTop;   // case x,y would not pertain to the actual node coords.

    //     // Update element's z-index.
    //     node.style.zIndex = ++dragObj.zIndex;

    //     // Save starting positions of cursor and element.
    //     dragObj.cursorStartX = event.clientX;
    //     dragObj.cursorStartY = event.clientY;
    //     dragObj.startX = x;
    //     dragObj.startY = y;

    //     this.isDragging = true;
    //     this.x = x;
    //     this.y = y;

    //     this.$bus.$emit(EVENT.DRAG_START, [x, y], this.$el);

    //     // Capture mousemove and mouseup events on the page.
    //     document.addEventListener(EVENT.MOUSE_MOVE, this.whileDragging);
    //     document.addEventListener(EVENT.MOUSE_UP, this.stopDragging);
    //   },

    //   whileDragging(event) {
    //     const x = dragObj.startX + event.clientX - dragObj.cursorStartX;
    //     const y = dragObj.startY + event.clientY - dragObj.cursorStartY;

    //     // we _always_ want to change the module's coordinates
    //     // while dragging, whether in editing mode or not:
    //     this.x = x;
    //     this.y = y;
    //     // this.$parent.x = module.x;

    //     this.$bus.$emit(EVENT.DRAG_ACTIVE, [x, y], this.$el);
    //   },

    //   stopDragging(event) {
    //     this.isDragging = false;
    //     this.$bus.$emit(EVENT.DRAG_END, this.id);

    //     if (this.$store.state.editing) {
    //       // we only want to update the Store with the
    //       // new coordinates if we are in editing mode:
    //       this.$store.commit('UPDATE_GRID_POSITION', {
    //         id: this.$parent.id,
    //         x: this.x,
    //         y: this.y
    //       });
    //     } else {
    //       // otherwise, restore the x,y coordinates -- we don't want the
    //       // module to have moved around when we switch out of play mode
    //       const module = this.$store.getters.active;

    //       this.x = module.x;
    //       this.y = module.y;
    //       // this.$parent.x = module.x;
    //     }

    //     document.removeEventListener(EVENT.MOUSE_MOVE, this.whileDragging);
    //     document.removeEventListener(EVENT.MOUSE_UP, this.stopDragging);
    //   }
    // }
  };
</script>
