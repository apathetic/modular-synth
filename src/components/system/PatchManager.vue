<template>
  <div
    xxxx-v-contextmenu:file
    class="patch-manager pad"
    :class="{
      'loaded': authenticated,
      'editing': editing
    }">

    <button class="save" @click="save">
      <!-- save -->
      <svg viewBox="0 0 100 100">
        <path fill="currentColor" d="M88.236,43.25c-0.309-14.487-12.151-26.134-26.707-26.134c-9.603,0-18.016,5.06-22.729,12.66   c-1.733-0.51-3.573-0.785-5.473-0.785c-8.27,0-15.322,5.194-18.072,12.501C7.702,43.557,2.151,50.469,2.151,58.678   c0,9.816,7.973,17.811,17.811,17.811h14.331l0.008-5.942H19.954c-6.556,0-11.867-5.329-11.867-11.87   c0-6.557,5.324-11.876,11.867-11.876v-0.003h0.082c0.74-6.68,6.407-11.875,13.282-11.875c3.138,0,6.022,1.086,8.304,2.896   c2.584-8.548,10.513-14.769,19.901-14.769c11.477,0,20.778,9.302,20.778,20.782c0,1.113-0.087,2.211-0.251,3.281   c5.249,1.224,9.159,5.947,9.159,11.564c0,6.557-5.321,11.87-11.858,11.87H65.004l-0.011,5.942h14.339   c9.84,0,17.815-7.976,17.819-17.811C97.152,52.095,93.568,46.328,88.236,43.25z"/>
        <path fill="currentColor" d="M62.223,60.091l-5.743-5.942l-6.29-6.508c-0.293-0.295-0.788-0.286-1.065-0.009l-6.299,6.517l-5.744,5.942   l-2.283,2.362c-0.139,0.139-0.219,0.35-0.219,0.578c0,0.119,0.021,0.235,0.061,0.336c0.115,0.297,0.383,0.48,0.699,0.48h8.641   l0.013,18.368c0,0.552,0.448,1,1,1h9.335c0.552,0,1-0.448,1-1V63.848h8.64c0.31,0,0.582-0.187,0.693-0.479   c0.124-0.319,0.058-0.699-0.166-0.928L62.223,60.091z"/>
      </svg>
    </button>

    <div class="dropdowns">

      <div class="patch select">
        <span>0{{ currentPatchKey }}</span>
        <button class="math add" @click="addPatch">+</button>
        <button class="math remove" @click="removePatch">-</button>
        <select v-model="currentPatchKey" ref="patchRef">
          <option value="" disabled selected>&lt;select patch&gt;</option>
          <option v-for="(patch, key) in patches" :value="key">{{ patch.name }}</option>
        </select>
        <input type="text" v-model="currentPatchName">
      </div>

      <div class="params select">
        <span>0{{ currentConfigKey }}</span>
        <button class="math add" @click="addConfig">+</button>
        <button class="math remove" @click="removeConfig">-</button>
        <select v-model="currentConfigKey" ref="configRef">
          <option value="" disabled selected>&lt;select configs&gt;</option>
          <option v-for="(config, key) in configs" :value="key">{{ config.name }}</option>
        </select>
        <input type="text" v-model="currentConfigName">
      </div>

    </div>

    <auth></auth>
    <!-- <sign-in></sign-in> -->

  </div>
</template>


<script>
  // import SignIn from './SignIn';
  import { defineComponent, computed, watch, ref, unref, nextTick } from 'vue';
  import { useSortable } from '@/composables';
  import { useAppStore } from '@/stores/app';
  import Auth from './Auth.vue';


  export default defineComponent({
    props: {},
    components: { Auth },
    setup () {
      console.log('%c ◌ PatchManager: setting up... ', 'background:black;color:white;font-weight:bold');
      const store = useAppStore();
      const { resetSorting } = useSortable();
      const authenticated = computed(() => store.isAuthenticated);
      const editing = computed(() => store.isEditing);
      const patch = computed(() => store.patch);
      const patches = computed(() => store.patches);
      const configs = computed(() => store.configs);
      const currentPatchKey = ref(store.patchKey);
      const currentConfigKey = ref(store.configKey);
      const patchRef = ref(null);
      const configRef = ref(null);

      const currentPatchName = computed({
        get() { return store.patch?.name },
        set(value) { store.patch.name = value }
      });
      const currentConfigName = computed({
        get() {
          const patch = store.patch;
          const key = store.paramsKey;
          return store.configs[key]?.name;
        },
        set(value) {
          const key = store.parameterKey;
          store.parameterSets[key].name = value;
        }
      });


      const save = () => store.savePatch();
      const load = () => {
        store.loadPatch();
        nextTick(() => {
          resetSorting();
        });
      };

      const addPatch = () => {
        // if (patches.length >= 9) { return; }
        store.addPatch();    // CREATE a new blank patch...
        store.loadPatch();   // ...AND then select it

        // as our new patch is at the end of the list, we can use ".length" as the index
        state.patchIndex = patch.selectedIndex = Object.keys(patches).length;
      };

      const removePatch = () => {
        const confirm = window.confirm('Delete ' + currentPatchName + '?');

        if (unref(patches).length <= 1 || !confirm) { return; }

        store.removePatch(currentPatchKey);
        // state.patchIndex = patch.selectedIndex = 1;

        // currentPatchKey = 0;
        store.patchKey = 0; // or patches[0].key...?
      };

      watch(currentPatchKey, (key, old) => {
        // this.currentPatchKey = e.target.value;
        // this.patchIndex = e.target.selectedIndex;
        // currentParamsKey = 0;    // always select 1st set when new patch loaded

        store.patchKey = key;
        store.paramsKey = 0;
        load();
      });

      // -----------------

      const addConfig = () => {
        // this.$store.commit('ADD_PARAMETERS');
        // this.currentConfigKey = this.parameterSets.length - 1;
        // this.ConfigIndex = this.$refs.Config.selectedIndex = this.parameterSets.length;
      };

      const removeConfig = (id) => {
        // const confirm = window.confirm('Delete ' + this.currentConfigName + '?');
        // if (this.$store.getters.parameterSets.length <= 1 || !confirm) { return; }

        // this.$store.commit('REMOVE_PARAMETERS', this.currentParamsKey);
        // this.paramsIndex = this.$refs.params.selectedIndex = 1;
        // this.currentParamsKey = 0;
      };

      // selectParams(e) {
      //   this.currentParamsKey = e.target.value;
      //   this.paramsIndex = e.target.selectedIndex;
      // },

      // onMounted() {
      load();
      // },

      return {
        authenticated,
        editing,
        save,

        currentPatchKey,
        currentConfigKey,
        currentPatchName,
        currentConfigName,

        patchRef,
        patches,
        addPatch,
        removePatch,

        configRef,
        configs,
        addConfig,
        removeConfig,
      }
    },
  });
</script>


<style lang="scss">
  @import '../../styles/variables.scss';

  .patch-manager {
    display: flex;

    .dropdowns {
      display: flex;
      flex: 0 1 100%;
      justify-content: center;
    }

    .save {
      align-self: center;
      padding: 2px 8px;

      &:hover {
        color: #349fdf;
      }

      svg {
        display: block;
        height: 2em;
      }
    }

    &:not(.loaded) {
      .dropdowns,
      .save {
        z-index: -1;
      }
    }

    &.editing {
      .math {
        transform: scale(1);
        opacity: 1;
      }

      input {
        left: var(--gap);
      }
    }

    &:not(.editing) {
      input {
        pointer-events: none;
      }

      .select {
        &:hover {
          color: var(--color-highlight);
        }
      }
    }
  }


  .dropdowns {

    .select {
      color: #fff;
      margin: 0 5px;
      font-size: 1.4em;
      padding:0;

      &::after {
        content: '▿';  // ▽
        position: absolute;
        right: 7px;
        top: 0;
        pointer-events: none;
      }
    }

    .math {
      display: block;

      border-radius: 50%;
      background: var(--color-grey-medium);
      border: 1px solid rgba(black, 0.1);

      font-size: 1em;
      font-family: inherit;

      position: absolute;
      left: 2px;
      height: 1.2em;
      width: 1.2em;

      cursor: pointer;
      line-height: 0;
      z-index: 1;

      opacity: 0;
      transform: scale(0);
      transition: all var(--transition-time-slow);

      &.add {
        top: -4px;
        }

      &.remove {
        bottom: -4px;
      }

      &:hover {
        color: var(--color-highlight);
      }
    }

    select {
      background: none;
      min-width: 16em;
      height: 100%;
      padding-right: var(--gap);
      font-size: inherit;
      color: inherit;
      opacity: 0;
    }

    input {
      font-size: 20px; // inherit;
      font-weight: 100;
      color: inherit;
      border: 0;
      background: none;
      position: absolute;
      height: 100%;
      left: 12px;
      right: var(--gap);
      top: -2px;
      transition: left var(--transition-time-slow);

      &:focus {
        outline: none;
      }
    }

    span {
      // font: 3.2em/0.65em 'Inconsolata';
      // font: 3.2em / 0.6em 'Dosis';
      font: 3em / 0.7em 'Anton';
      letter-spacing: 0.05em;
      position: absolute;
      right: var(--gap);
      opacity: 0.25;
      text-shadow: 1px 1px 2px #000;
      overflow: hidden;
      height: 100%;
    }
  }
</style>
