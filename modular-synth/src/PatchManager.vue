<template>
  <div class="patch-manager">
    <div class="patch">
      <button class="button" :class="{'active': $root.authenticated}" @click="savePatch">save</button>
      <select class="patch-selector" :class="{'active': !!selected}" @change="selectPatch" ref="patchSelector">
        <option value="" disabled selected>Select Patch</option>
        <option v-for="patch in patches" :value="patch">{{ patch }}</option>
      </select>
      <button class="button" :class="{'active': !!selected}" @click="activateLoad">load</button>
    </div>

    <div class="params">
      <select class="params-selector" @change="changeParams" ref="paramsSelector">
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
      selected: false
    };
  },

  computed: {
    current() {
      return encodeURI(this.$store.state.name.toLowerCase());  // see actions.js
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
    if (this.current) {
      this.$refs.patchSelector.value = this.current;
    }
  },

  methods: {
    selectPatch(e) {
      this.selected = e.target.value;
      this.pTimer = setTimeout(() => {
        this.selected = false;
        this.$refs.patchSelector.value = this.current;
      }, 10000);    // return to default val
    },

    activateLoad() {
      if (this.selected) {
        clearTimeout(this.pTimer);
        this.loadPatch(this.selected);
        this.selected = false;
      }
    },

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

    button:not(.active) {
      background-color: $color-hover;
      cursor: not-allowed;
      opacity: 0.5;
    }

    select {
      min-width: 8em;

      &.active {
        color: red;
        animation: flash 2s ease-out infinite;
      }
    }

    @keyframes flash {
      0% { color: #fff; }
      50% { color: $color-grey-medium; }
      100% { color: #fff; }
    }
  }
</style>
