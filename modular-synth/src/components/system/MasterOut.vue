<template>
  <div
    class="module"
    id="master-out"
    @mouseover="setFocus(id)"
    @mouseout="clearFocus()">

    <div class="module-interface">
      <Level label="Volume" :value.sync="gain" :min="0" :max="1"></Level>
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
import { setFocus, clearFocus, updateGridPosition } from '../../store/actions';
import Level from '../UI/Level';

export default {
  components: { Level },

  vuex: {
    actions: {
      setFocus,
      clearFocus,
      updateGridPosition
    }
  },

  data() {
    return {
      name: 'Master Out',
      id: 0,    // MasterOut is always id 0
      x: 0,
      y: 0,
      gain: 0.6,
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

  created() {
    this.out1 = this.context.createGain();
    this.out2 = this.context.createGain();

    this.out1.connect(this.context.destination);
    this.out2.connect(this.context.destination);

    this.inlets[0].data = this.out1;
    this.inlets[1].data = this.out2;
  },

  ready() {
    this.determinePosition();
    // window.addEventListener('load', this.determinePosition);
    window.addEventListener('resize', this.determinePosition);
  },

  methods: {
    setGain(g) {
      this.out1.gain.value = g;
      this.out2.gain.value = g;
    },

    determinePosition() {
      const x = this.$el.getBoundingClientRect().left;  // relative to viewport
      const y = this.$el.offsetTop;                     // relative to parent

      this.x = x;
      this.y = y;

      this.updateGridPosition(0, x, y);
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
