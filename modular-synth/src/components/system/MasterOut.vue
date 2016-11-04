<template>
  <div
    class="module"
    id="master-out"
    @mouseover="setFocus(id)"
    @mouseout="clearFocus()">

    <div class="module-interface">
      <Level></Level>
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="inlet in inlets"
          data-label="{{ inlet.label }}"
          data-port="{{ $index }}"
          class="inlet">
        </span>
      </div>
    </div>
</template>

<script>
import { setFocus, clearFocus, updatePosition } from '../../store/actions';
import Level from '../UI/Level';

export default {
  components: { Level },

  vuex: {
    actions: {
      setFocus,
      clearFocus,
      updatePosition
    }
  },

  data() {
    return {
      name: 'Master Out',
      id: 0,    // only one of these
      x: 0,     // for connections
      y: 0,
      inlets: [
        {
          port: 0,
          label: 'out-1',
          data: null
        }, {
          port: 1,
          label: 'out-2',
          data: null
        }
      ]
    };
  },

  ready() {
    const out1 = this.context.createGain();
    const out2 = this.context.createGain();

    out1.connect(this.context.destination);
    out2.connect(this.context.destination);

    this.inlets[0].data = out1;
    this.inlets[1].data = out2;

    this.determinePosition();
    // window.addEventListener('load', this.determinePosition);
    window.addEventListener('resize', this.determinePosition);
  },

  methods: {
    determinePosition() {
      const x = this.$el.getBoundingClientRect().left;  // relative to viewport
      const y = this.$el.offsetTop;                     // relative to parent

      this.x = x;
      this.y = y;

      this.updatePosition(0, x, y);
    }
  }
};
</script>

<style lang="scss">
  #master-out {
    border-width: 1px 0 0 0;
    border-color: #222;
    min-width: 100%;
    bottom: 0;
    width: auto;
    height: auto;

    .module-interface {
      visibility: visible;
    }
  }
</style>
