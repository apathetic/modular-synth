//------------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

// TODO this is just to get json into the App, dynamically. Will need to make more
// load-friendly ie. proper ajax implementation. Or just bundle json with the App.

<template>
  <header class="pad">
    <button class="button" @click="save">save</button>
    <select v-model="selected">
      <option value="juno">Juno</option>
      <option value="arp">Arp</option>
      <option v-for="patch in patches" :value="patch">{{ patch.name }}</option>
    </select>
    <button class="button" @click="load">load</button>
  </header>
</template>

<script>

// import { load } from './store/actions';
// import * as patches from './assets/patches';
// TODO THIS. BETTER :
import FM from '../static/patches/FM';
import Mod from '../static/patches/Mod';
import Blank from '../static/patches/blank';
import gridtest from '../static/patches/gridTest';
import miditest from '../static/patches/midiTest';

import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      name: 'wess',
      selected: {},
      patches: []
    };
  },

  mounted() {
    this.patches.push(FM);    // dumb way for testing for now
    this.patches.push(Mod);
    this.patches.push(Blank);
    this.patches.push(gridtest);
    this.patches.push(miditest);
  },

  methods: {
    load() {
      const patch = this.selected;

      localStorage.clear();
      // this.load(patch);
      this.$store.commit('LOAD', patch);
    },

    save() {
      // er... just get from store.getters...?
      const patch = {
        name: this.name,
        id: localStorage.getItem('id'),
        modules: localStorage.getItem('modules'),
        connections: localStorage.getItem('connections')
      };
      console.log(patch);
    },

    ...mapMutations([
      'LOAD'
    ])
  }
};

</script>

<style lang="scss">


</style>
