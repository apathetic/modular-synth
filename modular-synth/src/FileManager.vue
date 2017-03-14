<template>
  <header class="pad">
    <div class="patch">
      <button class="button" @click="savePatch">save</button>
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
      <!-- <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
        <g transform="translate(0,-1036.3622)">
          <path d="m 1,1050 4.5,-6 4.5,8 5,-6" style="stroke-linecap:butt;stroke-linejoin:miter;"/>
          <!- - m 1,1050 4.5,-8 2.5,10 5,-6 - - >
        </g>
      </svg> -->
    </div>
  </header>
</template>

<script>
import api from './store/api';
import { mapMutations } from 'vuex';

export default {
  data() {
    return {
      patch: '',    // the current patch name
      patches: [],  // a list of available patches
      //
      param: {},    // the current patch parameters
      params: []    // a list of parameter objects, each pertaining to the current patch
    };
  },

  /**
   * Immediately hit the server to populate a list of (the users') available patches.
   */
  created() {
    api.load('/patches')
      .then((response) => {
        this.patches = response.val();  // val() is a firebase thing
      })
      .catch((err) => {
        console.log(err);
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

    loadPatch(name) {
      api.load('/patch/' + name).then((patch) => {
        // ...
        console.log(patch);
      });
    },

    savePatch() {
      // const patch = {
      //   name: this.name,
      //   id: this.$store.state.id,
      //   modules: this.$store.state.modules,
      //   connections: this.$store.state.connections
      // };
      const patch = this.$store.state;
      console.log(patch);
    },

    loadPatchList() {

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
