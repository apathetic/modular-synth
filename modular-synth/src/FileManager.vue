//------------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

// TODO this is just to get json into the App, dynamically. Will need to make more
// load-friendly ie. proper ajax implementation. Or just bundle json with the App.

<template>
  <button>save</button>
  <select v-model="selected">
    <option value="juno">Juno</option>
    <option value="arp">Arp</option>
    <option v-for="patch in patches" :value="patch">{{ patch.name }}</option>
  </select>
  <button @click="loadIt">load</button>
</template>

<script>

// import { STORAGE_KEY_MODULES, STORAGE_KEY_CONNECTIONS } from './vuex/store';
import { load } from './vuex/actions';
// import * as patches from './assets/patches';
import FM from './assets/patches/FM';
import Mod from './assets/patches/Mod';

export default {
  vuex: {
    getters: {
      module: state => state.modules.find(function(module) { return module.id === state.activeModule; })
    },
    actions: {
      load
    }
  },
  data() {
    return {
      selected: {},
      patches: []
    };
  },
  ready() {
    this.patches.push(FM);
    this.patches.push(Mod);
  },
  methods: {
    loadIt() {
      const patch = this.selected;

      localStorage.clear();
      this.load(patch);
    }
  }
};

</script>

<style lang="scss">


</style>
