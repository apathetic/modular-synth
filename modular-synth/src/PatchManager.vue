<template>
  <div class="patch-manager">
    <div class="patch" :class="{'active': $root.authenticated}">
      <button class="button" @click="savePatch">save</button>
      <select class="patch-selector" :class="{'active': !!selectedPatch}" v-model="currentPatch" @change="selectPatch" ref="xxx">
        <option value="x" disabled>Select Patch</option>
        <option v-for="patch in patches" :value="patch">{{ patch }}</option>
      </select>
      <button class="button" :class="{'active': !!selectedPatch}" @click="changePatch">load</button>
    </div>

    <div class="params">
      <select class="params-selector" :value="currentParams" @change="selectParams">
        <option value="" disabled selected>Select settings</option>
        <option v-for="param in params" :value="param">{{ param }}</option>
      </select>
      <button class="button" :class="{'active': !!selectedParams}" @click="changeParams">load</button>
    </div>

  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      selectedPatch: false,
      selectedParams: false,
      currentPatch: 'x',
      currentParams: ''
    };
  },

  computed: {
    // current() {
    //   return encodeURI(this.$store.state.name.toLowerCase());  // see actions.js
    // },

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
   * NOTE: if a patch is already stored in localStorage, it'll get loaded by default.
   */
  created() {
    this.fetchPatches();
  },

  /**
   * Set the drop-down to the current patch (if loaded from localStorage)
   */
  mounted() {
    const current = encodeURI(this.$store.state.name.toLowerCase()) || false;

    if (current) {
      this.currentPatch = current;

      // this.$refs.xxx.value = current; // WHY WHY WHY WHWY WHYWYYY
      console.log(this.currentPatch, current);
    }
  },

  methods: {
    selectPatch(e) {
      const temp = this.currentPatch;

      this.currentPatch = e.target.value;
      this.selectedPatch = true;
      this.pTimer = setTimeout(() => {
        this.currentPatch = temp;
        this.selectedPatch = false;
      }, 10000);    // return to default val
    },

    changePatch() {
      if (this.selectedPatch) {
        clearTimeout(this.pTimer);
        this.loadPatch(this.currentPatch);
        this.selectedPatch = false;
      }
    },

    selectParams(e) {
      this.selectedParams = e.target.value;
      this.qTimer = setTimeout(() => {
        this.selectedParams = false;
        // this.$refs.paramsSelector.value = this.currentParams;
      }, 10000);    // return to default val
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

    // button:not(.active) {
    //   background-color: $color-hover;
    //   cursor: not-allowed;
    //   opacity: 0.5;
    // }

    select {
      min-width: 8em;

      &.active {
        animation: flash 2s ease-out infinite;
      }
    }

    .patch:not(.active) { display: none; }

    @keyframes flash {
      0% { color: #fff; }
      50% { color: $color-grey-medium; }
      100% { color: #fff; }
    }
  }
</style>
