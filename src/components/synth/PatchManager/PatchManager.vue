<template>
  <div :class="['patch-manager', {'editing': editing }]">

    <div class="patch select">
      <span>0{{currentPatchId}}</span>
      <select v-model="currentPatchId" ref="patchRef">
        <option value="" disabled selected>&lt;select patch&gt;</option>
        <option v-for="(patch, id) in patches" :key="patch.id" :value="id">{{ patch.name }}</option>
      </select>
      <input type="text" v-model="currentPatchName">
      <button class="add" @click="addPatch">+</button>
      <button class="remove" @click="removePatch">-</button>
    </div>

    <div class="params select">
      <span>0{{currentConfigId}}</span>
      <select v-model="currentConfigId" ref="configRef">
        <option value="" disabled selected>&lt;select configs&gt;</option>
        <option v-for="(config, id) in configs" :key="config.id" :value="id">{{ config.name }}</option>
      </select>
      <input type="text" v-model="currentConfigName">
      <button class="add" @click="addConfig">+</button>
      <button class="remove" @click="removeConfig">-</button>
    </div>

  </div>
</template>


<script lang="ts">
  import { defineComponent, computed, ref } from 'vue';
  import { useAppStore } from '@/stores/app';
  // import Select from './Select.vue';

  export default defineComponent({
    setup () {
      console.log('%c ◌ PatchManager: setting up... ', 'background:black;color:white;font-weight:bold');
      const store = useAppStore();
      const patchRef = ref(null);
      const configRef = ref(null);
      const editing = computed(() => store.isEditing);
      const patches = computed(() => store.patches);
      const configs = computed(() => store.configs);

      const currentPatchName = computed({
        get() { return store.patch?.name },
        set(value) { store.patch.name = value }
      });

      const currentConfigName = computed({
        get() { return store.config?.name; },
        set(value) { store.config.name = value; }
      });

      const currentConfigId = computed({
        get() { return store.configId; },
        set(id) { store.configId = id }
      });

      const currentPatchId = computed({
        get() { return store.patchId; },
        set(id) { store.loadPatch(id); currentConfigId.value = 0 }
      });


      function addPatch() {
        // if (patches.length >= 9) { return; }
        store.addPatch(); // CREATE a new blank patch and push it into patches
        currentPatchId.value = patches.value.length - 1; // ...then select it
      }

      function removePatch() {
        const confirm = window.confirm('Delete ' + currentPatchName.value + '?');

        if (patches.value.length <= 1 || !confirm) { return; }
        store.removePatch(currentPatchId.value);
      }

      function addConfig() {
        store.addConfig();
        currentConfigId.value = configs.value.length - 1; // load it (via watch) and select it.
      }

      function removeConfig() {
        const confirm = window.confirm('Delete ' + currentConfigName.value + '?');

        if (configs.value.length <= 1 || !confirm) { return; }
        store.removeConfig(currentConfigId.value);
      }


      store.loadPatch();


      return {
        editing,

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
      button {
        transform: scale(1);
        transition-delay: var(--transition-time);
        opacity: 1;
      }

      input {
        pointer-events: all;
      }

      .select {
        &:hover {
          color: inherit;
        }

        &::after {
          opacity: 0;
          transition-delay: 0s;
        }
      }
    }

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
        right: 8px;
        top: 0;
        opacity: 1;
        pointer-events: none;
        transition: opacity var(--transition-time-slow);
        transition-delay: var(--transition-time);
      }
    }

    button {
      border-radius: 50%;
      background: var(--color-grey-medium);
      border: 1px solid rgba(black, 0.1);
      cursor: pointer;
      display: block;
      font-size: 1em;
      font-family: inherit;
      height: 1.2em;
      line-height: 0;
      opacity: 0;
      position: absolute;
      right: 2px;
      transform: scale(0);
      transition: all var(--transition-time-slow);
      width: 1.2em;
      z-index: 1;

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
      font: 3em / 0.7em 'Anton';
      height: 100%;
      letter-spacing: 0.05em;
      opacity: 0.25;
      overflow: hidden;
      position: absolute;
      right: var(--gap);
      text-shadow: 1px 1px 2px #000;
    }
  }
</style>
