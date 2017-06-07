<template>
  <div class="patch-manager">
    <auth></auth>

    <div class="menu" :class="{'active': $root.authenticated}">

      <button class="save button" @click="save">save</button>

      <div class="patch selector">
        <span>{{ patchIndex }}</span>
        <select :value="currentPatch" @change="selectPatch" ref="patch">
          <option value="" disabled selected>&lt;select patch&gt;</option>
          <option v-for="(patch, key) in patches" :value="key">{{ patch.name }}</option>
        </select>
      </div>

      <div class="params selector">
        <span>{{ paramsIndex }}</span>
        <select :value="currentParams" @change="selectParams" ref="params">
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
      currentPatch: '',    // key (cleaned patch name)
      currentParams: 0,    // integer index

      patchIndex: '-'
      // paramsIndex: '-'
    };
  },

  computed: {
    patches() { return this.$store.state.patches; },
    parameterSets() { return this.patches[this.currentPatch] && this.patches[this.currentPatch].parameterSets || []; },
    // patchIndex() { return this.$refs.patch.selectedIndex || '-'; },    // *sigh* cannot reference $refs inside computed prop
    paramsIndex() { return +this.currentParams + 1 || '-'; },
    ...mapGetters([
      'modules'
    ])
  },

  /**
   * Set the drop-down to the current patch (if loaded from localStorage)
   */
  mounted() {
    const key = this.$store.state.key;

    if (key) {
      // TODO 100 WTFs. I really have no idea why this needs setTImeout:
      setTimeout(() => {
        this.currentPatch = key;
      }, 1000);
    }

    this.$bus.$emit('parameters:load');
    // this.loadParameters();
  },

  methods: {
    save() {
      this.savePatch();
    },

    selectPatch(e) {
      this.currentPatch = e.target.value;  // key, (cleaned name)
      this.loadPatch(this.currentPatch);
      this.currentParams = this.parameterSets.length ? 0 : -1;  // always select 1st set
      this.patchIndex = this.$refs.patch.selectedIndex;

      // this.$bus.$emit('parameters:load');
      // this.loadParameters();
      // this.$nextTick(() => {    // nextTick here so that event isn't emitted before current Knob(s) have a chance to be destroyed
      // setTimeout(() => {
      this.$bus.$emit('parameters:load');
      // }, 1000);
      // });
    },

    selectParams(e) {
      this.currentParams = e.target.value;  // integer, index
      this.$store.commit('LOAD_PARAMETERS', this.currentParams);
      // this.paramsIndex = this.$refs.params.selectedIndex;

      this.$bus.$emit('parameters:load');
      // this.loadParameters();
    },

    // loadParameters() {
    //   this.$nextTick(() => {
    //     this.$bus.$emit('parameters:load');
    //   });
    // },

    ...mapActions([
      'savePatch',
      'loadPatch'
      // 'loadParameters'
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
