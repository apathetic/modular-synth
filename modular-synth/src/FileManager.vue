//------------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

// TODO this is just to get json into the App, dynamically. Will need to make more
// load-friendly ie. proper ajax implementation. Or just bundle json with the App.

<template>
  <button @click="saveIt">save</button>
  <select v-model="selected">
    <option value="juno">Juno</option>
    <option value="arp">Arp</option>
    <option v-for="patch in patches" :value="patch">{{ patch.name }}</option>
  </select>
  <button @click="loadIt">load</button>
</template>

<script>

import { load } from './store/actions';
// import * as patches from './assets/patches';
import FM from '../static/patches/FM';
import Mod from '../static/patches/Mod';
import gridtest from '../static/patches/gridTest';

export default {
  vuex: {
    actions: {
      load
    }
  },
  data() {
    return {
      name: 'wess',
      selected: {},
      patches: []
    };
  },
  ready() {
    this.patches.push(FM);    // dumb way for testing for now
    this.patches.push(Mod);
    this.patches.push(gridtest);
  },
  methods: {
    loadIt() {
      const patch = this.selected;

      localStorage.clear();
      this.load(patch);
    },
    saveIt() {
      const patch = {
        name: this.name,
        id: localStorage.getItem('id'),
        cid: localStorage.getItem('cid'),
        modules: localStorage.getItem('modules'),
        connections: localStorage.getItem('connections')
      };
      console.log(patch);
    }
  }
};

</script>

<style lang="scss">


</style>
