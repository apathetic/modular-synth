<template>
  <div class="patch-manager">
    <auth></auth>

    <div class="menu" :class="{'active': $root.authenticated}">

      <button class="save button" @click="save">save</button>

      <!-- TODO : this could prob be a component -->
      <div class="patch select">
        <span>{{ patchIndex }}</span>
        <select :value="currentPatch" @change="selectPatch" ref="patch">
          <option value="" disabled selected>&lt;select patch&gt;</option>
          <option v-for="(patch, key) in patches" :value="key">{{ patch.name }}</option>
        </select>
        <input type="text" v-model="currentPatchName" @change="updatePatchName">
      </div>

      <div class="params select">
        <span>{{ paramsIndex }}</span>
        <select :value="currentParams" @change="selectParams" ref="params">
          <option value="" disabled selected>&lt;select settings&gt;</option>
          <option v-for="(params, index) in parameterSets" :value="index">{{ params.name }}</option>
        </select>
        <input type="text" v-model="currentParamsName" @change="updateParamsName">
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
      currentPatch: '',    // key ("cleaned" patch name)
      currentPatchName: '',
      currentParams: 0,    // integer index
      currentParamsName: '',

      patchIndex: '-'
      // paramsIndex: '-'
    };
  },

  computed: {
    patches() { return this.$store.state.patches; },
    parameterSets() { return this.patches[this.currentPatch] && this.patches[this.currentPatch].parameterSets || []; },
    // patchIndex() { return this.$refs.patch.selectedIndex || '-'; },    // *sigh* cannot reference $refs inside computed prop
    paramsIndex() { return +this.currentParams + 1 || '-'; },

    // currentPatchName() { return this.patches[this.currentPatch].name; },
    // currentParamsName() { return this.patches[this.currentPatch].parameterSets[this.currentParams].name; },

    ...mapGetters([
      'modules'
    ])
  },

  /**
   * Set the drop-down to the current patch (if loaded from localStorage)
   */
  mounted() {
    const key = this.$store.state.patchKey;

    if (key) {
      // TODO 100 WTFs. I really have no idea why this needs setTImeout:
      setTimeout(() => {
        this.currentPatch = key;
      }, 1000);
    }

    this.$bus.$emit('parameters:load');
  },

  methods: {
    save() {
      this.savePatch();
    },

    updatePatchName(e) {
      this.patches[this.currentPatch].name = e.target.value;
    },

    updateParamsName(e) {
      this.patches[this.currentPatch].parameterSets[this.currentParams].name = e.target.value;
    },

    selectPatch(e) {
      this.currentPatch = e.target.value;  // key, (cleaned name)
      this.loadPatch(this.currentPatch);
      this.currentParams = this.parameterSets.length ? 0 : -1;  // always select 1st set
      this.patchIndex = this.$refs.patch.selectedIndex;

      this.$bus.$emit('parameters:load');
      this.currentPatchName = this.patches[this.currentPatch].name; // TODO make computed
    },

    selectParams(e) {
      this.currentParams = e.target.value;  // integer, index
      this.$store.commit('LOAD_PARAMETERS', this.currentParams);
      // this.paramsIndex = this.$refs.params.selectedIndex;
      this.$bus.$emit('parameters:load');
      // this.currentParamsName = this.patches[this.currentPatch].parameterSets[this.currentParams].name;
    },

    ...mapActions([
      'savePatch',
      'loadPatch'
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

    .select {
      margin: 0 1px;
      font-size: 1.5em;
      padding:0;

      &::after {
        content: '▿';  // ▽
        position: absolute;
        right: 5px;
        top: 5px;
        opacity: .2;
        pointer-events: none;
      }
    }

    select {
      background: none;
      min-width: 12em;
      height: 100%;
      padding-left: 24px;
      padding-right: 24px;
      font-size: inherit;
      color: inherit;

      opacity: 0;
    }

    input {
      font-size: inherit;
      color: inherit;
      border: 0;
      background: none;
      width: calc(100% - 24px);
      height: 100%;
      padding-left: 24px;
      position: absolute;
      top: 0;

      &:focus { outline: none; }
    }

    span {
      font-family: $font-secondary;
      font-size: 1.3em;
      line-height: 1.5;
      opacity: 0.2;
      padding: 0 0.2em;
      position: absolute;
      left: 0;
      // z-index: 1;
    }
  }
</style>
