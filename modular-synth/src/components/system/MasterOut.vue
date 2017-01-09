<template>
  <div
    class="module"
    id="master-out"
    @mouseover="setFocus(id)"
    @mouseout="clearFocus">

    <div class="module-interface">
      <level
        label="Volume"
        min="0"
        max="1"
        @value="gain = $event">
      </level>

      {{ gain }}

      <button
        class="toggle"
        :class="isMuted ? 'toggle--active' : ''"
        @click="toggleMute">
          mute
      </button>
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
  </div>
</template>

<script>
import Level from '../UI/Level';
import { mapActions } from 'vuex';

export default {
  components: { Level },

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
          label: 'out-1',
          data: null
        }, {
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

    this.$bus.$on('audio:start', this.start);
    this.$bus.$on('audio:stop', this.stop);

    console.log('Creating MasterOut');
  },

  mounted() {
    this.determinePosition();
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

      this.$store.commit('UPDATE_GRID_POSITION', {
        id: 0,
        x: x,
        y: y
      });
    },

    // VUEX actions, bound as local methods:
    ...mapActions([
      'setFocus',
      'clearFocus'
    ])
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
