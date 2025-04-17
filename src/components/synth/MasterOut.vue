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
  import { defineComponent, ref, computed, watch, onMounted } from 'vue';
  import { useAppStore } from '@/stores';
  import { log } from '@/utils/logger';
  import { context, gain as gainNode } from '@/audio';
  import VU from '../UI/VU';


  export default defineComponent({
    name: 'MasterOut',
    components: { VU },
    setup(props, { expose }) {
      log({ type:'component', action:'creating', data:'MasterOut' });

      const store = useAppStore();
      const masterModule = computed(() => store.patch.modules[0]);

      const out1 = gainNode(0.5);
      const out2 = gainNode(0.5);

      out1.connect(context.destination);
      out2.connect(context.destination);

      const el = ref<HTMLElement | null>(null);
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

      onMounted(() => {
        const modRef: HTMLElement | null = document.querySelector('#modules'); // rare time we need to scrape DOM. Doesnt need to be reactive
        if (!modRef) throw new Error('Could not find #modules element');

        store.addToRegistry({
          id: 0,
          node: { inlets },
        });

        function determinePosition() {
          const m: HTMLElement = el.value!;
          const x = modRef!.scrollLeft + m.getBoundingClientRect().left;  // scroll offset + viewport offset
          const y = m.offsetTop; // relative to parent

          masterModule.value.x = x;
          masterModule.value.y = y;
        }

        window.addEventListener('resize', determinePosition);
        modRef.addEventListener('scroll', determinePosition);

        determinePosition();
      });

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
        setFocus: store.setFocus,
        clearFocus: store.clearFocus,
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
