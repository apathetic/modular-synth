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
        v-model="gain"
      />
      <VU :audio="out2" />
    </div>

    <div class="module-connections">
      <Inlets :ports="inlets" :id="0"></Inlets>
    </div>
  </div>
</template>


<script>
  import { mapState, mapActions } from 'pinia';
  import { useAppStore } from '@/stores/app';
  import { EVENT } from '../../events';
  import VU from '../UI/VU';

  export default {
    name: 'MasterOut',
    inject: [ 'context' ],
    components: { VU },
    computed: {
      ...mapState(useAppStore, [
        'power',
        'modules'
      ])
    },

    data() {
      return {
        // name: 'Master Out',
        id: 0, // MasterOut is always id 0
        x: 0,
        y: 0,
        gain: 0.5,
        isMuted: false,
        inlets: [
          { label: 'out-1' },
          { label: 'out-2' }
        ]
      };
    },

    created() {
      this.stop();

      this.out1 = this.context.createGain();
      this.out2 = this.context.createGain();

      this.inlets[0].audio = this.out1;
      this.inlets[1].audio = this.out2;

      this.out1.connect(this.context.destination);
      this.out2.connect(this.context.destination);

      this.$watch('gain', this.setGain);


      // TODO move out of here
      this.$watch('power', (on) => {
        (on) ? this.start() : this.stop();
      });


      console.log('Creating MasterOut');
    },

    mounted() {
      this.modulesRef = document.querySelector('#modules'); // rare time we need to scrape DOM. Doesnt need to be reactive
      this.determinePosition();

      window.addEventListener(EVENT.RESIZE, this.determinePosition);
      this.modulesRef.addEventListener(EVENT.SCROLL, this.determinePosition);

      this.addToRegistry({
        id: 0,
        node: this,
      });
    },

    methods: {
      // TODO move out of here
      start() { this.context.resume(); },
      stop() { this.context.suspend(); },

      setGain(g) {
        this.out1.gain.linearRampToValueAtTime(g, this.context.currentTime + 0.1);
        this.out2.gain.linearRampToValueAtTime(g, this.context.currentTime + 0.1);
      },

      determinePosition(e) {
        const x = this.modulesRef.scrollLeft +               // scroll offset +
                  this.$el.getBoundingClientRect().left;  // viewport offset
        const y = this.$el.offsetTop;                     // relative to parent

        this.x = x;
        this.y = y;

        // updateGridPosition:
        this.modules[0].x = x;
        this.modules[0].y = y;
      },

      // store actions, bound as local methods:
      ...mapActions(useAppStore, [
        'addToRegistry',
        'setFocus',
        'clearFocus'
      ])
    }
  };
</script>

<style lang="scss">
  @import '../../styles/variables.scss';
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
      height: var(--height);
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
    width: var(--height);
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
      background: var(--color-grey-dark);
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
