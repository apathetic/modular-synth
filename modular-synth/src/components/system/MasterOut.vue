<template>
  <div
    class="module"
    id="master-out"
    @mouseover="setFocus(id)"
    @mouseout="clearFocus">

    <div class="module-interface">
      <VU :audio="out1" />
      <input
        type="range"
        orient="vertical"
        min="0"
        max="1"
        step="0.05"
        v-model="gain">
      </input>
      <VU :audio="out2" />
    </div>

    <div class="module-connections">
      <inlets :ports="inlets"></inlets>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import VU from '../system/VU';

// import { meter } from '../../mixins/meter';
// import { meter } from '../../audio';

export default {
  // mixins: [meter],
  components: { VU },

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
        }, {
          label: 'out-2'
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

    console.log('Creating MasterOut');
  },

  mounted() {
    // const X = this.$refs.meter;

    // this.meter = meter(X);
    // console.log(this.meter);

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

    setGain(g) {
      this.out1.gain.linearRampToValueAtTime(g, this.context.currentTime + 0.1);
      this.out2.gain.linearRampToValueAtTime(g, this.context.currentTime + 0.1);
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
  @import '../../assets/scss/variables.scss';
  $height: 132px;

  #master-out {
    position: relative;
    border-width: 1px 0 0 0;
    border-color: #222;
    min-width: 100%;
    bottom: 0;
    width: auto;
    height: auto;

    canvas {
      width: 20px;
      height: $height;
    }

    .module-interface {
      padding: 2em 1em 1em;
      visibility: visible;
      display: flex;
      justify-content: center;
    }

  }

  // .slider,
  input[type="range"] {
    z-index: 1;
    width: $height;
    height: 40px;
    margin-top: 46px;
    position: absolute;
    cursor: pointer;
    -webkit-transform: rotate(-90deg);

    &:focus {
      outline: none;
    }

    &::-webkit-slider-runnable-track {
      height: 5px;
      background: $color-grey-dark;
      border: none;
    }

    &::-webkit-slider-thumb {
      // border: none;
      // height: 1em;
      // width: 1em;
      // border-radius: 50%;
      background: red;
      margin-top: -5px;
      -webkit-appearance: none;
    }
  }
</style>
