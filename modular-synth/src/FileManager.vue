<template>
  <header class="pad">
    <div class="patch">
      <button class="button" @click="save">save</button>
      <select class="patch-selector" v-model="patch">
        <option v-for="patch in patches" :value="patch">{{ patch }}</option>
      </select>
      <button class="button" @click="load">load</button>
    </div>

    <div class="params">
      {{ param.name }}
      <select class="params-selector" v-model="param">
        <option v-for="param in params" :value="param">{{ param.name }}</option>
      </select>
      <button class="button" @click="loadParameters">load</button>
    </div>

    <div class="branding">
      ^%*
    </div>
  </header>
</template>

<script>

import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      patch: '',    // the current patch
      patches: [],  // a list of available patches
      //
      param: {},    // the current patch parameters
      params: []    // a list of parameter objects, each pertaining to the current patch
    };
  },

  /**
   * Immediately hit the server to populate a list of (the users') patches.
   */
  created() {
    this.fetchJSON('/api/patches')
      .then((json) => {
        this.patches = json.patches;
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
    fetchJSON(path) {
      return window.fetch(path)
        .then((response) => {
          return response.json();
        })
        .catch((error) => {
          console.log('Could not fetch JSON from %s (%s)', path, error.message);
        });
    },

    load() {
      const name = this.name;

      console.log('Loading patch: ', name);
      this.fetchJSON('/api/patches/' + name)
        .then((json) => {
          // console.log(json);
          localStorage.clear();
          this.$store.commit('LOAD', json.patch);
          this.$bus.$emit('app:load');
          // this.$store.commit('LOAD_PATCH', json.patch);
          // this.$store.commit('LOAD_PARAMS', json.params[0]);
        });
    },

    loadParameters() {

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

    ...mapMutations([
      'LOAD'
    ])
  }
};

</script>

<style lang="scss">
  @import 'assets/scss/variables.scss';

  header {
    display: flex;
    justify-content: space-between;
  }

  .patch {}
  .params {
    width: 240px;
    background: $color-grey-dark;
  }
  .branding {}


  .params-selector,
  .patch-selector {
    min-width: 8em;
  }

</style>
