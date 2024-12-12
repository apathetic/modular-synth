<template>
  <div
    ref="el"
    class="module"
    id="master-out"
    @mouseover="setFocus(0)"
    @mouseout="clearFocus"
  >

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


<script lang="ts">
  import { defineComponent, ref, computed, watch, onMounted, inject } from 'vue';
  import { useAppStore } from '@/stores';
  import { log } from '@/utils/logger';
  import VU from '../UI/VU';


  export default defineComponent({
    name: 'MasterOut',
    components: { VU },
    setup(props, { expose }) {
      log({ type:'component', action:'creating', data:'MasterOut' });

      const store = useAppStore();
      const power = computed(() => store.power);
      const modules = computed(() => store.modules);
    // const module = store.getModule(0);

      const context: AudioContext = inject('context');
      const out1 = context.createGain();
      const out2 = context.createGain();

      out1.connect(context.destination);
      out2.connect(context.destination);

      const el = ref(null);
      const gain = ref(0.5);
      const inlets = [
        {
          label: 'out-1',
          audio: out1
        },
        {
          label: 'out-2',
          audio: out2
        }
      ];

      stop();
      watch(gain, setGain);
      watch(power, (on) => (on) ? start() : stop()); // TODO move out of here

      onMounted(() => {
        const modRef: HTMLElement | null = document.querySelector('#modules'); // rare time we need to scrape DOM. Doesnt need to be reactive
        if (!modRef) throw new Error('Could not find #modules element');

        store.addToRegistry({
          id: 0,
          node: {
            name: 'MasterOut',
            inlets,
            gain
          },
        });

        window.addEventListener('resize', determinePosition);
        modRef.addEventListener('scroll', determinePosition);
        determinePosition();

        function determinePosition() {
          const x = modRef.scrollLeft +               // scroll offset +
                    el.value.getBoundingClientRect().left;  // viewport offset
          const y = el.value.offsetTop;                     // relative to parent

          modules.value[0].x = x;
          modules.value[0].y = y;
        }
      });

        // TODO move out of here
      function start() { context.resume(); }
      function stop() { context.suspend(); }
      function setFocus(id: number) { store.setFocus(id); }
      function clearFocus() { store.clearFocus(); }

      function setGain(g: number) {
        out1.gain.linearRampToValueAtTime(g, context.currentTime + 0.1);
        out2.gain.linearRampToValueAtTime(g, context.currentTime + 0.1);
      }

      // AUDIO
      expose({
        inlets
      });

      // UI
      return {
        el,
        setFocus,
        clearFocus,
        out1,
        out2,
        gain,
        inlets,
      };
    }
  });
</script>


<style lang="scss">
  #master-out {
    position: relative;
    border: 0;
    padding-bottom: 2rem;
    width: auto;
    height: auto;

    padding-top: 8rem;
    border-top: 2px ridge #000;
    border-radius: 0;

    .module-interface {
      // padding: 2em 1em 1em;
      padding: 0;
      visibility: visible;
      display: flex;
      justify-content: center;
      gap: 2px;
    }

  }

  // .slider,
  input[type="range"] {
    appearance: none;
    background: transparent;
    cursor: pointer;
    direction: rtl;
    writing-mode: vertical-lr;
    position: absolute;
    z-index: 1;

    &:focus {
      outline: none;
    }

    &::-webkit-slider-thumb {
      appearance: none;
      background: white;
      width: 32px;
      height: 3px;
    }
  }
</style>
