<template>
  <header class="pad">
    <div class="patch">
      <button class="button" @click="savePatch">save</button>
      <select class="patch-selector">
        <option value="" disabled selected hidden>Select Patch</option>
        <option v-for="patch in patches" :value="patch">{{ patch }}</option>
      </select>
      <button class="button" @click="loadPatch">load</button>
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
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      // patch: '',    // the current patch name
      // patches: [],  // a list of available patches
      //
      param: {},    // the current patch parameters
      params: []    // a list of parameter objects, each pertaining to the current patch
    };
  },

  computed: {
    patch: function(state) {
      return state.name;
    },
    patches: function(state) {
      // return Object.keys(state.patches);
      // console.log(state.patches);
      // return state.patches;
    }
  },

  /**
   * Immediately hit the server to populate a list of (the users') available patches.
   */
  created() {
    this.loadPatches();
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
    ...mapActions([
      'savePatch',
      'loadPatch',
      'loadPatches',
      'loadParameters'
    ])
  }
};

</script>

<style lang="scss">
  @import 'assets/scss/variables.scss';

  header {
    display: flex;
    justify-content: space-between;

    select {
      background: rgba(0,0,0, 0.2);
      color: #fff;
    }
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
