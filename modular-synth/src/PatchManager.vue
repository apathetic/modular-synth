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
        <input type="text" v-model="currentPatchName">
      </div>

      <div class="params select">
        <span>{{ paramsIndex }}</span>
        <select :value="currentParams" @change="selectParams" ref="params">
          <option value="" disabled selected>&lt;select settings&gt;</option>
          <option v-for="(params, index) in parameterSets" :value="index">{{ params.name }}</option>
        </select>
        <input type="text" v-model="currentParamsName">
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

      // patches: [{
      //   name: '',
      //   key: '',
      //   parameterSets: []
      // }]
    };
  },

  computed: {
    parameterSets() {
      let patches = this.$store.state.patches;
      let current = this.$store.state.patchKey;

      return patches[current] && patches[current].parameterSets || [];
    },

    // patch() {
    //   return this.$store.state.patchKey && this.$store.state.patches[this.$store.state.patchKey] || {};
    // },

    patchIndex() { return this.$refs.patch && this.$refs.patch.selectedIndex || '-'; },    // *sigh* cannot reference $refs inside computed prop
    // paramsIndex() { return this.$refs.params.selectedIndex || '-'; },    // *sigh* cannot reference $refs inside computed prop
    paramsIndex() { return this.currentParams ? this.currentParams + 1 : '-'; },

    ...mapGetters([
      'patches'
      // 'patch',
      // 'parameterSets',
      // 'parameters'
    ])
  },

  // watch: {
  //   currentPatch: function(name) {
  //     this.currentPatchName = name;
  //   }
  // },

  created() {
    // const patches = this.$store.state.patches;
    // create a reduced representation of the patches, parameterSets for display _in the module only_
    // Object.keys(patches).forEach((key) => {
    //   this.patches.push({
    //     key,
    //     name: patches[key].name,
    //     parameterSets: patches[key].parameterSets.map(s => s.name)
    //   });
    // });



    const key = this.$store.state.patchKey;
    if (key) {
      // TODO 100 WTFs. I really have no idea why this needs setTImeout:
      // https://github.com/vuejs/vue/issues/3842
      setTimeout(() => {
        this.currentPatch = key;
        this.load();
      }, 1000);
    }
  },

  mounted() {
    this.$bus.$emit('parameters:load');

    // this.$store.watch(this.$store.getters.patches
  },

  methods: {
    save() {
      this.$store.state.name = this.currentPatchName;
      this.savePatch();
    },

    load() {
      this.loadPatch(this.currentPatch);
      this.currentPatchName = this.patches[this.currentPatch].name;
      // this.patchIndex = this.$refs.patch.selectedIndex;

      // this.currentParams = this.patch.parameterSets.length ? 0 : -1;  // always select 1st set

      // this.$bus.$emit('parameters:load');
      // this.paramsIndex = this.$refs.params.selectedIndex;
      // this.currentParamsName = this.parameters && this.parameters.name;
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
