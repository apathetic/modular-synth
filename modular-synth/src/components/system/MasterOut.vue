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
        :value="gain"
        @input="update">
      </input>

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

    <div class="module-power">
      <button
        class="power"
        :class="power ? 'on' : 'off'"
        @click="togglePower">

        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40">
          <path d="M28,18c0,6.629-5.375,12-12,12C9.371,30,4,24.629,4,18c0-5.223,3.34-9.652,8-11.301v4.41C9.617,12.496,8,15.047,8,18 c0,4.418,3.582,8,8,8s8-3.582,8-8c0-2.953-1.621-5.504-4-6.891v-4.41C24.656,8.348,28,12.777,28,18z M16,16c1.105,0,2-0.895,2-2V4 c0-1.104-0.895-2-2-2s-2,0.896-2,2v10C14,15.105,14.895,16,16,16z" />
        </svg>
      </button>
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
      // power: false,
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

    // this.$bus.$on('audio:start', this.start);
    // this.$bus.$on('audio:stop', this.stop);

    this.$watch('power', (on) => {
      if (on) {
        this.start();
      } else {
        this.stop();
      }
    });

    this.$watch('gain', this.setGain);
    this.$watch('isMuted', () => { this.setGain(this.gain); });

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

    update(e) {
      this.gain = e.target.value;
      this.setGain(this.gain);    // TODO a nice audioRamp
    },

    setGain(g) {
      this.out1.gain.value = this.isMuted ? 0 : g;
      this.out2.gain.value = this.isMuted ? 0 : g;
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
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
      'togglePower',
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

    button {
      margin: 0
    }

    .toggle {
      display: none; // mute button
    }

    .module-interface {
      padding: 2em 1em 1em 3.2em;
      visibility: visible;
    }

    .module-power {
      text-align: center;
    }
  }
</style>
