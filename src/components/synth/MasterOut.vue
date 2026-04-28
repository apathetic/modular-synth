<template>
  <div
    ref="el"
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
  import { useAppStore } from '~/stores';
  import { log } from '~/utils/logger';
  import { master, MASTER_ID } from '~/audio/master';
  import VU from '../UI/VU';


  /*
    MasterOut is a singleton: its audio graph (gain nodes, destination wiring,
    `registry.add(0, ...)`) is built once at module load in `~/audio/master`.
    This component is a UI shell, rendered exactly once in App.vue's sidebar.
  */
  export default defineComponent({
    name: 'MasterOut',
    components: { VU },
    setup(_props, { expose }) {
      log({ type:'component', action:'creating', data:'MasterOut' });

      const store = useAppStore();
      const masterModule = computed(() => store.patch.modules.find((m: Module) => m.id === MASTER_ID));

      const el = ref<HTMLElement | null>(null);
      const gain = ref(0.5);

      watch(gain, master.setGain);

      onMounted(() => {
        const modRef: HTMLElement | null = document.querySelector('#modules'); // rare time we need to scrape DOM. Doesnt need to be reactive
        if (!modRef) throw new Error('Could not find #modules element');

        function determinePosition() {
          const m: HTMLElement = el.value!;
          const mod = masterModule.value;
          if (!m || !mod) return;

          mod.x = modRef!.scrollLeft + m.getBoundingClientRect().left;
          mod.y = m.offsetTop;
        }

        window.addEventListener('resize', determinePosition);
        modRef.addEventListener('scroll', determinePosition);

        determinePosition();
      });

      expose({ inlets: master.inlets });

      return {
        el,
        setFocus: store.setFocus,
        clearFocus: store.clearFocus,
        out1: master.out1,
        out2: master.out2,
        gain,
        inlets: master.inlets,
      };
    }
  });
</script>


<style>
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
      /* padding: 2em 1em 1em; */
      padding: 0;
      visibility: visible;
      display: flex;
      justify-content: center;
      gap: 2px;
    }

  }

  /* .slider, */
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
