<template>
  <div
    xxxx-v-contextmenu:file
    :class="['patch-manager', {'editing': editing }]"
  >

    <div class="patch select">
      <span>0{{currentPatchId}}</span>
      <button class="math add" @click="addPatch">+</button>
      <button class="math remove" @click="removePatch">-</button>
      <select v-model="currentPatchId" ref="patchRef">
        <option value="" disabled selected>&lt;select patch&gt;</option>
        <option v-for="(patch, id) in patches" :key="patch.id" :value="id">{{ patch.name }}</option>
      </select>
      <input type="text" v-model="currentPatchName">
    </div>

    <div class="params select">
      <span>0{{currentConfigId}}</span>
      <button class="math add" @click="addConfig">+</button>
      <button class="math remove" @click="removeConfig">-</button>
      <select v-model="currentConfigId" ref="configRef">
        <option value="" disabled selected>&lt;select configs&gt;</option>
        <option v-for="(config, id) in configs" :key="config.id" :value="id">{{ config.name }}</option>
      </select>
      <input type="text" v-model="currentConfigName">
    </div>

  </div>
</template>


<script>
  import { defineComponent, computed, watch, ref, nextTick } from 'vue';
  import { useSortable } from '@/composables';
  import { useAppStore } from '@/stores/app';
  // import Select from './Select.vue';

  export default defineComponent({
    setup () {
      console.log('%c ◌ PatchManager: setting up... ', 'background:black;color:white;font-weight:bold');
      const { resetSorting } = useSortable();
      const store = useAppStore();

      const editing = computed(() => store.isEditing);
      const patches = computed(() => store.patches);
      const configs = computed(() => store.configs);

      const currentPatchId = ref(store.patchId);
      const currentConfigId = ref(store.configId);
      const patchRef = ref(null);
      const configRef = ref(null);

      const currentPatchName = computed({
        get() { return store.patch?.name },
        set(value) { store.patch.name = value }
      });

      const currentConfigName = computed({
        get() { return store.config?.name; },
        set(value) { store.config.name = value; }
      });

      watch(currentPatchId, (id, old) => {
        store.patchId = id;
        store.configId = 0; // select 1st set when new patch loaded
        load();
      });

      watch(currentConfigId, (id, old) => {
        store.configId = id;
      });

      function load() {
        store.loadPatch();
        nextTick(resetSorting);
      }

      function addPatch() {
        // if (patches.length >= 9) { return; }
        store.addPatch();    // CREATE a new blank patch...
        store.loadPatch();   // ...and then select it
      }

      function removePatch() {
        const confirm = window.confirm('Delete ' + currentPatchName + '?');

        if (patches.value.length <= 1 || !confirm) { return; }
        store.removePatch(currentPatchKey);
      }

      function addConfig() {
        store.addConfig();
      };

      function removeConfig(id) {
        const confirm = window.confirm('Delete ' + currentConfigName + '?');

        if (configs.value.length <= 1 || !confirm) { return; }
        store.removeConfig(currentConfigId);
      };


      load();


      return {
        editing,
        // editing: store.isEditing,

        patches,
        patchRef,
        addPatch,
        removePatch,
        currentPatchId,
        currentPatchName,

        configs,
        configRef,
        addConfig,
        removeConfig,
        currentConfigId,
        currentConfigName,
      }
    },
  });
</script>


<style lang="scss">
  @import '@/styles/variables.scss';

  .patch-manager {
    display: flex;
    flex: 0 1 100%;
    justify-content: center;

    &.editing {
      .math {
        transform: scale(1);
        opacity: 1;
      }

      input {
        left: var(--gap);
        pointer-events: all;
      }

      .select {
        &:hover {
          color: inherit;
        }
      }

    }

    // :not(.editing) & {
    //   input {
    //     pointer-events: none;
    //   }

    //   .select {
    //     &:hover {
    //       color: var(--color-highlight);
    //     }
    //   }
    // }



    .select {
      color: #fff;
      margin: 0 5px;
      font-size: 1.4em;
      padding:0;

      &:hover {
        color: var(--color-highlight);
      }

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
      pointer-events: none;
      position: absolute;
      height: 100%;
      left: 12px;
      right: var(--gap);
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
