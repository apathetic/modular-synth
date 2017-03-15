<template>
  <div class="patch-manager">
    <div class="patch">
      <button class="button" @click="savePatch">save</button>
      <select class="patch-selector">
        <option value="" disabled selected hidden>Select Patch</option>
        <option v-for="patch in patches" :value="patch">{{ patch }}</option>
      </select>
      <button class="button" @click="loadPatch">load</button>
      {{ patch }}
    </div>

    <div class="params">
      <select class="params-selector" @change="changeParams">
        <option v-for="param in params" :value="param">{{ param }}</option>
      </select>
    </div>

    <div></div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      // patch: '',    // the current patch name
      // patches: [],  // a list of available patches
      //
      param: {}        // the current patch parameters
      // params: []    // a list of parameter objects, each pertaining to the current patch
    };
  },

  computed: {
    patch() {
      return this.$store.state.name;
    },

    patches() {
      return Object.keys(this.$store.state.patches);
    },

    params() {
      return this.$store.state.parameterSets.map((params) => {
        return params.name;
      });
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
    changeParams(e) {
      e.target.value;
    },

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

  .patch-manager {
    display: flex;
    justify-content: space-between;
  }

  header {
    select {
      background: rgba(0,0,0, 0.2);
      color: #fff;
    }
  }

  .params-selector,
  .patch-selector {
    min-width: 8em;
  }
</style>
