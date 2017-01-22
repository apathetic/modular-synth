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

import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      name: '',
      selected: {},
      patches: []
    };
  },

  /**
   * Immediately hit the server to fetch a list of (the users') patches.
   */
  created() {
    window.fetch('/api/patches')
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      this.patches = json.patches;
      this.parsePatches();
      console.log('Patches loaded from server');
    })
    .catch((error) => {
      console.log('Could not fetch patches: ' + error.message);
    });
  },

  /**
   * Set the drop-down to the current patch (if loaded from localStorage)
   */
  mounted() {
    console.log(this.$store.state.name);
  },

  methods: {
    load() {
      const patch = this.selected;

      localStorage.clear();

      console.log('Loading patch: ', patch.name);
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

    parsePatches() {
      this.patches.forEach((p) => {

      });
    },

    ...mapMutations([
      'LOAD'
    ])
  }
};

</script>

<style lang="scss">


</style>
