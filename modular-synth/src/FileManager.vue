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
   * Immediately hit the server to populate a list of (the users') patches.
   * While they are available, the App does not load any one at this time.
   */
  created() {
    window.fetch('/api/patches')
    .then((response) => {
      return response.json();
    })
    .then((json) => {
      this.patches = json.patches;
      this.parsePatches();
      console.log('Patches fetched from server');
    })
    .catch((error) => {
      console.log('Could not fetch patches: ' + error.message);
    });
  },

  /**
   * Set the drop-down to the current patch (if loaded from localStorage)
   */
  mounted() {
    if (this.$store.state.name) {
      console.log('Using patch: ', this.$store.state.name);
    }
  },

  methods: {
    load() {
      const patch = this.selected;

      localStorage.clear();

      console.log('Loading patch: ', patch.name);
      this.$store.commit('LOAD', patch);
      this.$bus.$emit('app:load');
    },

    save() {
      // const patch = {
      //   name: this.name,
      //   id: this.$store.state.id,
      //   modules: this.$store.state.modules,
      //   connections: this.$store.state.connections
      // };
      const patch = this.$store.state;
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
