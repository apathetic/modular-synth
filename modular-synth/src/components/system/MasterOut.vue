<template>
  <div
    class="module"
    id="master-out"
    @mouseover="setFocus(id)"
    @mouseout="clearFocus()">

    <div class="module-interface">
      <meter label="Volume" @value="gain = value" :min="0" :max="1"></meter>
      <button
        class="toggle"
        :class="isMuted ? 'toggle--active' : ''"
        @click="toggleMute">
          mute
      </button>
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="(inlet, index) in inlets"
          :data-label="inlet.label"
          :data-port="index"
          class="inlet">
        </span>
      </div>
    </div>
</template>

<script>
import { setFocus, clearFocus, updateGridPosition } from '../../store/actions';
import Meter from '../UI/Meter';

export default {
  components: { Meter },

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
      gain: 0.5,
      isMuted: false,
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

    this.inlets[0].data = this.out1;
    this.inlets[1].data = this.out2;

    this.$on('start', this.start);
    this.$on('stop', this.stop);
  },

  ready() {
    this.determinePosition();
    // });

    // window.addEventListener('load', this.determinePosition);
    window.addEventListener('resize', this.determinePosition);
  },

  methods: {
    // Chrome (in informal testing) is smart enough to know when there is no
    // audio chain of connected nodes, and optimizes accordingly.
    start() {
      this.out1.connect(this.context.destination);
      this.out2.connect(this.context.destination);
    },

    stop() {
      this.out1.disconnect(this.context.destination);
      this.out2.disconnect(this.context.destination);
    },

    setGain(g) {
      this.out1.gain.value = g;
      this.out2.gain.value = g;
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      this.setGain(
        this.isMuted ? 0 : this.gain
      );
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
