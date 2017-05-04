<template>
  <div class="patch-manager">
    <auth></auth>

    <div class="menu" :class="{'active': $root.authenticated}">

      <button class="save button" @click="save">save</button>

      <div class="patch selector">
        <span>{{ patchIndex }}</span>
        <select :value="currentPatch" @change="selectPatch">
          <option value="" disabled selected>&lt;select patch&gt;</option>
          <option v-for="(patch, key) in patches" :value="key">{{ patch.name }}</option>
        </select>
      </div>

      <div class="params selector">
        <span>{{ parameterIndex }}</span>
        <select :value="currentParams" @change="selectParams">
          <option value="" disabled selected>&lt;select settings&gt;</option>
          <option v-for="(params, index) in parameterSets" :value="index">{{ params.name }}</option>
        </select>
      </div>

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
      currentPatch: null,
      currentParams: 0
    };
  },

  computed: {
    patches() { return this.$store.state.patches; },
    parameterSets() { return this.patches[this.currentPatch] && this.patches[this.currentPatch].parameterSets || []; },
    patchIndex() { return +this.currentPatch + 1 || '-'; },
    parameterIndex() { return +this.currentParams + 1 || '-'; },
    ...mapGetters([
      'modules'
    ])
  },

  /**
   * Set the drop-down to the current patch (if loaded from localStorage)
   */
  mounted() {
    // const current = this.$store.state.patches.find((p) => { return p.name === this.$store.state.name; });
    // const current = this.$store.state.patches[this.$store.state.key];
    //
    // this.currentPatch = this.$store.state.patches.indexOf(current);
    // pos = myArray.map(function(e) { return e.hello; }).indexOf('stevie');

    this.$bus.$emit('parameters:load');
  },

  methods: {
    save() {
      this.savePatch();
    },

    selectPatch(e) {
      this.currentPatch = e.target.value;  // key, cleaned name
      this.loadPatch(this.currentPatch);
      this.currentParams = this.parameterSets.length ? 0 : null;
      this.$bus.$emit('parameters:load');
    },

    selectParams(e) {
      this.currentParams = e.target.value;  // integer, index
      this.$store.commit('LOAD_PARAMETERS', this.currentParams);
      this.$bus.$emit('parameters:load');
    },

    ...mapActions([
      'savePatch',
      'loadPatch',
      'loadParameters'
    ])
  }
};

</script>

<style lang="scss">
  @import 'assets/scss/variables.scss';

  .patch-manager {
    .menu {
      display: flex;
      justify-content: center;

      &:not(.active) { display: none; }
    }

    .save {
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
</style>
