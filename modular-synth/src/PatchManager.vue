<template>
  <header class="patch-manager pad" :class="{'active': $root.authenticated}">

    <!-- <button class="save button" @click="save">save</button> -->
    <auth></auth>

    <div class="menu">
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


  </header>
</template>

<script>
import Auth from './Auth';
import { generateKey } from './store/firebase';
import { mapGetters, mapActions } from 'vuex';

export default {
  components: {
    Auth
  },

  data() {
    return {
      currentPatch: '',    // key
      currentParams: 0,    // integer index
      currentPatchName: '',
      currentParamsName: '',
      patchIndex: '',
      paramsIndex: ''
      // menuCoords: []
    };
  },

  computed: {
    parameterSets() {
      let patches = this.$store.state.patches;
      let current = this.$store.state.patchKey;

      return patches[current] && patches[current].parameterSets || [];
    },

    ...mapGetters([
      'patches'
    ])
  },

  watch: {
    currentPatch: function() { this.updatePatchDisplay(); },
    currentParams: function() { this.updateParamsDisplay(); }
  },

  mounted() {
    const key = this.$store.state.patchKey;

    if (key) {
      // TODO 100 WTFs. I really have no idea why this needs setTImeout:
      // https://github.com/vuejs/vue/issues/3842
      setTimeout(() => {
        this.currentPatch = key;
        this.load();

        this.updatePatchDisplay();
        this.updateParamsDisplay();
      }, 1000);
    }


    // this.$refs.manager.addEventListener('contextmenu', (e) => {
    //   e.preventDefault();
    //   this.menuCoords = [e.pageX, e.pageY];
    // });
  },

  methods: {
    save() {
      // this.$store.state.name = this.currentPatchName;
      this.savePatch({
        key: this.currentPatch || generateKey(this.currentPatchName),
        name: this.currentPatchName,
        paramName: this.currentParamsName
      });
    },

    load() {
      this.loadPatch(this.currentPatch);
      this.$bus.$emit('parameters:load');
    },

    selectPatch(e) {
      this.currentPatch = e.target.value;
      this.currentParams = 0;  // always select 1st set when new patch loaded
      this.load();
    },

    selectParams(e) {
      this.currentParams = e.target.value;
      this.$store.commit('LOAD_PARAMETERS', this.currentParams);
      this.$bus.$emit('parameters:load');
    },

    updatePatchDisplay() {
      this.patchIndex = this.$refs.patch.selectedIndex || '-';
      this.currentPatchName = this.patches.length && this.patches[this.currentPatch].name;
    },

    updateParamsDisplay() {
      this.paramsIndex = this.$refs.params.selectedIndex || '-';
      this.currentParamsName = this.patches.length && this.patches[this.currentPatch].parameterSets[this.currentParams].name;
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
    display: flex;

    .menu {
      display: flex;
      flex: 0 1 100%;
      justify-content: center;
    }

    // .save {
    //   align-self: center;
    // }

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

    &:not(.active) {
      .menu,
      .save {
        z-index: -1;
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
