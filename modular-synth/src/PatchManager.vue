<template>
  <header class="patch-manager pad" :class="{'active': $root.authenticated}">

    <button class="save button" @click="save">save</button>

    <div class="menu">
      <!-- TODO : this could prob be a component -->
      <div class="patch select">
        <span>{{ patchIndex }}</span>
        <button class="add" @click="add">+</button>
        <select :value="currentPatch" @change="selectPatch" ref="patch">
          <option value="" disabled selected>&lt;select patch&gt;</option>
          <option v-for="(patch, key) in patches" :value="key">{{ patch.name }}</option>
        </select>
        <input type="text" v-model="currentPatchName">
      </div>

      <div class="params select">
        <span>{{ paramsIndex }}</span>
        <button class="add" @click="addPatch">+</button>
        <select :value="currentParams" @change="selectParams" ref="params">
          <option value="" disabled selected>&lt;select settings&gt;</option>
          <option v-for="(params, index) in parameterSets" :value="index">{{ params.name }}</option>
        </select>
        <input type="text" v-model="currentParamsName">
      </div>

    </div>

    <auth></auth>

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

    // LOAD what we can from localStorage first. It's possible we'll load something
    // before we've FETCHED any data from the backend.

    // if (key) {
      // TODO 100 WTFs. I really have no idea why this needs setTImeout:
      // https://github.com/vuejs/vue/issues/3842
    setTimeout(() => {
      this.currentPatch = key;
      this.load();
    }, 1000);
    // }
  },

  methods: {
    save() {
      this.savePatch({
        key: this.currentPatch || generateKey(this.currentPatchName),
        name: this.currentPatchName,
        paramName: this.currentParamsName
      });
    },

    load() {
      this.loadPatch();

      if (Object.keys(this.patches).length) {
        this.updatePatchDisplay();
        this.updateParamsDisplay();
      }

      // make sure all Knobs n' such are in the DOM, and ready
      this.$nextTick(function() {
        this.$bus.$emit('parameters:load');
      });
    },

    add() {
      this.addPatch();
      this.loadPatch();      // AND NOW SELECT THAT BLANK PATCH
    },

    selectPatch(e) {
      this.currentPatch = e.target.value;
      this.$store.commit('SET_KEY', this.currentPatch);
      this.currentParams = 0;  // always select 1st set when new patch loaded
      this.load();
    },

    selectParams(e) {
      this.currentParams = e.target.value;
      this.$store.commit('LOAD_PARAMETERS', this.currentParams);
      this.$bus.$emit('parameters:load');
    },

    updatePatchDisplay() {
      this.patchIndex = ~this.$refs.patch.selectedIndex ? '0' + this.$refs.patch.selectedIndex : '';
      // this.currentPatchName = this.patches[this.currentPatch] && this.patches[this.currentPatch].name;
      this.currentPatchName = this.patches[this.currentPatch].name;
    },

    updateParamsDisplay() {
      this.paramsIndex = ~this.$refs.params.selectedIndex ? '0' + this.$refs.params.selectedIndex : '';
      // we're assuming good data integrity; dont need to check "if exists"
      // this.currentParamsName = this.patches[this.currentPatch] && this.patches[this.currentPatch].parameterSets && this.patches[this.currentPatch].parameterSets[this.currentParams].name;
      this.currentParamsName = this.patches[this.currentPatch].parameterSets.length && this.patches[this.currentPatch].parameterSets[this.currentParams].name;
      if (!this.currentParamsName) {
        this.currentParamsName = '';    // should prob disable the input
      }
    },

    ...mapActions([
      'savePatch',
      'loadPatch',
      'addPatch'
    ])
  }
};

</script>

<style lang="scss">
  @import 'assets/scss/variables.scss';
  $gap: 24px;

  .patch-manager {
    display: flex;

    .menu {
      display: flex;
      flex: 0 1 100%;
      justify-content: center;
    }

    .save {
      align-self: center;
    }

    .select {
      margin: 0 5px;
      font-size: 1.4em;
      padding:0;
      overflow: hidden;

      &::after {
        content: '▿';  // ▽
        position: absolute;
        right: 7px;
        top: 5px;
        // opacity: 0.2;
        pointer-events: none;
      }
    }

    .add {
      padding: 3px;
      font-size: 1.2em;
      width: $gap;
      // opacity: 0.2;
    }

    &:not(.active) {
      .menu,
      .save {
        z-index: -1;
      }
    }

    select {
      background: none;
      min-width: 15em;
      height: 100%;
      padding-right: $gap;
      font-size: inherit;
      color: inherit;
      opacity: 0;
    }

    input {
      font-size: inherit;
      color: inherit;
      border: 0;
      background: none;
      position: absolute;
      height: 100%;
      left: $gap;
      right: $gap;
      top: 0;

      &:focus { outline: none; }
    }

    span {
      font: 3em/0.7em $font-secondary;
      font-weight: bold;
      position: absolute;
      right: 0.5em;
      opacity: 0.1;
    }
  }
</style>
