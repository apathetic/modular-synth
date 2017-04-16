<template>
  <div class="patch-manager">
    <div class="actions">
      <auth></auth>
      <button class="button" @click="savePatch">save</button>
    </div>

    <div class="patch selector" :class="{'active': $root.authenticated}">
      <span>{{ patchNum }}</span>
      <select v-model="currentPatch" @change="selectPatch">
        <option value="" disabled>&lt;select patch&gt;</option>
        <option v-for="patch in patchNames" :value="patch">{{ patch }}</option>
      </select>
      <!-- <button class="button" :class="{'active': !!selectedPatch}" @click="changePatch">load</button> -->
    </div>

    <div class="params selector">
      <span>{{ paramsNum }}</span>
      <select v-model="currentParams" @change="selectParams">
        <option value="" disabled>&lt;select settings&gt;</option>
        <option v-for="param in paramNames" :value="param">{{ param }}</option>
      </select>
      <!-- <button class="button" :class="{'active': !!selectedParams}" @click="changeParams">load</button> -->
    </div>
  </div>
</template>

<script>
import Auth from './Auth';
import { mapActions } from 'vuex';

export default {
  components: {
    Auth
  },

  data() {
    return {
      // selectedPatch: false,
      // selectedParams: false,
      currentPatch: '',
      currentParams: ''
    };
  },

  computed: {
    patchNames() {
      return Object.keys(this.$store.state.patches);
    },

    patchNum() {
      return this.patchNames.indexOf(this.currentPatch) + 1 || '-';
    },

    paramNames() {
      const patch = this.$store.state.patches[this.currentPatch];

      return (!patch) ? [] : patch.parameterSets.map((params) => {
        return params.name;
      });
    },

    paramsNum() {
      return this.paramNames.indexOf(this.currentParams) + 1 || '-';
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
      // const patch = this.$store.state.patches[current];

      this.currentPatch = current;
      // this.currentParams = patch.parameterSets[0];
      console.log('----- mounted', current);
      console.log(this.currentPatch, current);
    }
  },

  methods: {
    selectPatch(e) {
      this.loadPatch(this.currentPatch);

      // const temp = this.currentPatch;
      //
      // this.currentPatch = e.target.value;
      // this.selectedPatch = true;
      // this.pTimer = setTimeout(() => {
      //   this.currentPatch = temp;
      //   this.selectedPatch = false;
      // }, 10000);    // return to default val
    },

    // changePatch() {
    //   if (this.selectedPatch) {
    //     clearTimeout(this.pTimer);
    //     this.loadPatch(this.currentPatch);
    //     this.selectedPatch = false;
    //   }
    // },

    selectParams(e) {
      // this.loadParamaters(this.currentParams);


      // this.selectedParams = e.target.value;
      // this.qTimer = setTimeout(() => {
      //   this.selectedParams = false;
      //   // this.$refs.paramsSelector.value = this.currentParams;
      // }, 10000);    // return to default val
    },

    // changeParams(e) {
    //   e.target.value;
    // },

    ...mapActions([
      'savePatch',
      'loadPatch',
      'fetchPatches'
    ])
  }
};

</script>

<style lang="scss">
  @import 'assets/scss/variables.scss';

  .patch-manager {
    display: flex;
    justify-content: center;

    // button:not(.active) {
    //   background-color: $color-hover;
    //   cursor: not-allowed;
    //   opacity: 0.5;
    // }

    .patch:not(.active) { display: none; }

    .actions {
      position: absolute;
      left: 0;
    }
  }

  .selector {
    margin: 0 1px;

    select {
      font-size: 1.5em;
      min-width: 8em;
      padding: 0em 0.5em 0 1.8em;
      //
      // &.active {
      //   animation: flash 2s ease-out infinite;
      // }
    }

    span {
      font-family: $font-secondary;
      font-size: 1.8em;
      line-height: 1.6;
      opacity: 0.2;
      padding: 0 0.5em;
      position: absolute;
      z-index: 1;
    }
  }
  //
  // @keyframes flash {
  //   0% { color: #fff; }
  //   50% { color: $color-grey-medium; }
  //   100% { color: #fff; }
  // }

</style>
