//------------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

// TODO this is just to get json into the App, dynamically. Will need to make more
// load-friendly ie. proper ajax implementation. Or just bundle json with the App.

<template>
  <div class="pad">
    <button class="button" @click="save">save</button>
    <select v-model="selected">
      <option value="juno">Juno</option>
      <option value="arp">Arp</option>
      <option v-for="patch in patches" :value="patch">{{ patch.name }}</option>
    </select>
    <button class="button" @click="loadIt">load</button>
  </div>
</template>

<script>

import { load } from './store/actions';
// import * as patches from './assets/patches';
import FM from '../static/patches/FM';
import Mod from '../static/patches/Mod';
import Blank from '../static/patches/blank';
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
    this.patches.push(Blank);
    this.patches.push(gridtest);
  },

  methods: {
    loadIt() {
      const patch = this.selected;

      localStorage.clear();
      this.load(patch);
    },
    save() {
      const patch = {
        name: this.name,
        id: localStorage.getItem('id'),
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
