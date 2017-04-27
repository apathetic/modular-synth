<template>
  <div class="patch-manager">
    <div class="actions">
      <auth></auth>
      <button class="button" @click="save">save</button>
    </div>

    <div class="patch selector" :class="{'active': $root.authenticated}">
      <span>{{ patchNum }}</span>
      <select :value="currentPatch" @change="selectPatch">
        <option value="" disabled selected>&lt;select patch&gt;</option>
        <option v-for="(patch, key) in patches" :value="key">{{ patch.name }}</option>
      </select>
    </div>

    <div class="params selector">
      <span>{{ paramsNum }}</span>
      <select :value="currentParams" @change="selectParams">
        <option value="" disabled selected>&lt;select settings&gt;</option>
        <option v-for="(params, index) in parameterSets" :value="params.name">{{ params.name }}</option>
      </select>
    </div>

  </div>
</template>

<script>
import Auth from './Auth';
import { mapGetters, mapActions } from 'vuex';

export default {
  components: {
    Auth
  },

  data() {
    return {
      currentPatch: '',
      currentParams: ''
    };
  },

  computed: {
    patches() { return this.$store.state.patches; },
    parameterSets() { return this.patches[this.currentPatch] && this.patches[this.currentPatch].parameterSets || []; },

    patchNames() {
      return Object.keys(this.$store.state.patches);
      // return this.$store.state.patches.map((patch) => {
      //   return patch.name;
      // });
    },

    patchNum() {
      return this.patchNames.indexOf(this.currentPatch) + 1 || '-';
    },

    paramNames() {
      // return this.parameterSets.map((params, index) => {
      //   return params.name;
      // });
    },

    paramsNum() {
      // return this.paramNames.indexOf(this.currentParams) + 1 || '-';
      // let i;
      //
      // this.parameterSets.forEach((params, index) => {
      //   if (params.name === this.currentParams) {
      //     i = index;
      //   };
      // });
      // return i;
    },

    ...mapGetters([
      'modules'
    ])
  },

  /**
   * Immediately hit the server to populate a list of (the users') available patches.
   * NOTE: if a patch is already stored in localStorage, it'll get loaded by default.
   * NOTE: this is now in main.js
   */
  // created() {
  //   this.fetchPatches();
  // },

  /**
   * Set the drop-down to the current patch (if loaded from localStorage)
   */
  mounted() {
    const current = encodeURI(this.$store.state.name.toLowerCase()) || false;

    if (current) {
      setTimeout(() => {
        this.currentPatch = current;
        this.currentParams = this.parameterSets[0];
      }, 2000);
    }
  },

  methods: {
    save() {
      // let o = {
      //   name: 'xxxx',
      //   params: {}
      // };
      //
      // const paramsets = this.modules.map((m) => {
      //   console.log(m, m.name, m.id);
      //   o.params[m.id] = m.parameterize();
      // });
      //
      // console.log(paramsets);
      this.savePatch();
    },

    selectPatch(e) {
      this.currentPatch = e.target.value;
      this.loadPatch(this.currentPatch);
    },

    selectParams(e) {
      this.currentParams = e.target.value;

      // const parameterSets = this.$store.state.patches[this.currentPatch].parameterSets;
      // const parameterSet = parameterSets.find((p) => { return p.name === this.currentParams; });
      // const parameters = parameterSet.parameters || [];

      // this.$store.commit('LOAD_PARAMETERS', parameters);
      this.$store.commit('LOAD_PARAMETERS', this.currentParams);
    },

    ...mapActions([
      'savePatch',
      'loadPatch',
      'loadParameters',
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
