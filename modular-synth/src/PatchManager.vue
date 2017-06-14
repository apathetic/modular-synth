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
          <option v-for="(params, index) in patch.parameterSets" :value="index">{{ params.name }}</option>
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
      currentPatch: '',    // key
      currentPatchName: '',
      currentParams: 0,    // integer index
      currentParamsName: ''

      // patchIndex: '-'
      // paramsIndex: '-'
    };
  },

  computed: {

    // parameterSets() { return this.patch.parameterSets || []; },

    patchIndex() { return this.$refs.patch && this.$refs.patch.selectedIndex || '-'; },    // *sigh* cannot reference $refs inside computed prop
    // paramsIndex() { return this.$refs.params.selectedIndex || '-'; },    // *sigh* cannot reference $refs inside computed prop
    paramsIndex() { return this.currentParams ? this.currentParams + 1 : '-'; },

    // currentPatchName() { return this.patches[this.currentPatch].name; // this.$store.state.name; },
    // currentParamsName() { return this.patches[this.currentPatch].parameterSets[this.currentParams].name; },

    ...mapGetters([
      'patches',
      'patch',
      'parameters'
    ])
  },

  // watch: {
  //   currentPatch: function(name) {
  //     this.currentPatchName = name;
  //   }
  // },

  created() {
    const key = this.$store.state.patchKey;

    if (key) {
      // TODO 100 WTFs. I really have no idea why this needs setTImeout:
      // https://github.com/vuejs/vue/issues/3842
      setTimeout(() => {
        this.currentPatch = key;
        this.load();
        this.$bus.$emit('parameters:load');
      }, 1000);
    }
  },

  mounted() {
    this.$bus.$emit('parameters:load');
  },

  methods: {
    save() {
      this.savePatch();
    },

    load() {
      this.loadPatch(this.currentPatch);
      this.currentPatchName = this.patch.name;
      // this.patchIndex = this.$refs.patch.selectedIndex;

      this.currentParams = this.patch.parameterSets.length ? 0 : -1;  // always select 1st set
      // this.$bus.$emit('parameters:load');
      // this.paramsIndex = this.$refs.params.selectedIndex;
      // this.currentParamsName = this.parameters && this.parameters.name;
    },

    updatePatchName(e) {
      this.patch.name = e.target.value;
    },

    updateParamsName(e) {
      this.parameters.name = e.target.value;
    },

    selectPatch(e) {
      this.currentPatch = e.target.value;  // key, (cleaned name)
      this.load();
    },

    selectParams(e) {
      this.currentParams = e.target.value;  // integer, index
      this.$store.commit('LOAD_PARAMETERS', this.currentParams);
      this.$bus.$emit('parameters:load');

      // this.paramsIndex = this.$refs.params.selectedIndex;
      // this.currentParamsName = this.parameters && this.parameters.name;
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
      font-size: 1.2em;
      line-height: 1.7;
      opacity: 0.2;
      padding: 0 0.4em;
      position: absolute;
      left: 0;
      // z-index: 1;
    }
  }
</style>
