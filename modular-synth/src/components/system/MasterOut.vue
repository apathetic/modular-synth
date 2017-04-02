<template>
  <div
    class="module"
    id="master-out"
    @mouseover="setFocus(id)"
    @mouseout="clearFocus">

    <div class="module-interface">

      NOTE: THIS DOES NOT TURN OFF.
      <!-- < l evel :audio="out1"></level>
      < l evel :audio="out2"></level> -->

      <input
        type="range"
        orient="vertical"
        min="0"
        max="1"
        step="0.1"
        v-model="gain"
        >
      </input>

      <!-- <button
        class="toggle"
        :class="isMuted ? 'toggle--active' : ''"
        @click="toggleMute">
          mute
      </button> -->
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Level from '../UI/Level';

export default {
  components: { Level },

  computed: {
    ...mapGetters([
      'power'
    ])
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
          label: 'out-1'
          // data: null
        }, {
          label: 'out-2'
          // data: null
        }
      ]
    };
  },

  created() {
    this.out1 = this.context.createGain();
    this.out2 = this.context.createGain();

    this.inlets[0].audio = this.out1;
    this.inlets[1].audio = this.out2;

    this.$watch('power', (on) => {
      if (on) {
        this.start();
      } else {
        this.stop();
      }
    });

    this.$watch('gain', this.setGain);
    // this.$watch('isMuted', () => { this.setGain(this.gain); });

    console.log('Creating MasterOut');
  },

  mounted() {
    this.determinePosition();
    window.addEventListener('resize', this.determinePosition);
  },

  methods: {
    // Chrome and FF (in informal testing) are smart enough to know when there is no
    // audio chain of connected nodes, and optimize accordingly.
    start() {
      this.out1.connect(this.context.destination);
      this.out2.connect(this.context.destination);
    },

    stop() {
      this.out1.disconnect(this.context.destination);
      this.out2.disconnect(this.context.destination);
    },

    // update(e) {
    //   this.gain = e.target.value;
    //   this.setGain(this.gain);    // TODO a nice audioRamp
    // },

    setGain(g) {
      console.log(g);
      this.out1.gain.linearRampToValueAtTime(g, this.context.currentTime + 0.1);
      this.out2.gain.linearRampToValueAtTime(g, this.context.currentTime + 0.1);

      // this.out1.gain.value = this.isMuted ? 0 : g;
      // this.out2.gain.value = this.isMuted ? 0 : g;
    },

    // toggleMute() {
    //   this.isMuted = !this.isMuted;
    // },

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
    position: relative;
    border-width: 1px 0 0 0;
    border-color: #222;
    min-width: 100%;
    bottom: 0;
    width: auto;
    height: auto;

    .module-interface {
      padding: 2em 1em 1em 3.2em;
      visibility: visible;
    }
  }
</style>
