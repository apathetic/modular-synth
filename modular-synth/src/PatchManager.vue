<template>
  <header class="patch-manager pad"
    :class="{
      'active':  $root.authenticated,
      'editing': editing
    }">

    <button class="save button" @click="save">
      <!-- save -->
      <svg viewBox="0 0 100 100">
        <path fill="currentColor" d="M88.236,43.25c-0.309-14.487-12.151-26.134-26.707-26.134c-9.603,0-18.016,5.06-22.729,12.66   c-1.733-0.51-3.573-0.785-5.473-0.785c-8.27,0-15.322,5.194-18.072,12.501C7.702,43.557,2.151,50.469,2.151,58.678   c0,9.816,7.973,17.811,17.811,17.811h14.331l0.008-5.942H19.954c-6.556,0-11.867-5.329-11.867-11.87   c0-6.557,5.324-11.876,11.867-11.876v-0.003h0.082c0.74-6.68,6.407-11.875,13.282-11.875c3.138,0,6.022,1.086,8.304,2.896   c2.584-8.548,10.513-14.769,19.901-14.769c11.477,0,20.778,9.302,20.778,20.782c0,1.113-0.087,2.211-0.251,3.281   c5.249,1.224,9.159,5.947,9.159,11.564c0,6.557-5.321,11.87-11.858,11.87H65.004l-0.011,5.942h14.339   c9.84,0,17.815-7.976,17.819-17.811C97.152,52.095,93.568,46.328,88.236,43.25z"/>
        <path fill="currentColor" d="M62.223,60.091l-5.743-5.942l-6.29-6.508c-0.293-0.295-0.788-0.286-1.065-0.009l-6.299,6.517l-5.744,5.942   l-2.283,2.362c-0.139,0.139-0.219,0.35-0.219,0.578c0,0.119,0.021,0.235,0.061,0.336c0.115,0.297,0.383,0.48,0.699,0.48h8.641   l0.013,18.368c0,0.552,0.448,1,1,1h9.335c0.552,0,1-0.448,1-1V63.848h8.64c0.31,0,0.582-0.187,0.693-0.479   c0.124-0.319,0.058-0.699-0.166-0.928L62.223,60.091z"/>
      </svg>
    </button>

    <div class="dropdowns">
      <!-- TODO : this could prob be a component -->
      <div class="patch select">
        <span>0{{ patchIndex }}</span>

        <button class="math add" @click="add">+</button>
        <button class="math remove" @click="remove">-</button>

        <select :value="currentPatchKey" @change="select" ref="patch">
          <option value="" disabled selected>&lt;select patch&gt;</option>
          <option v-for="(patch, key) in patches" :value="key">{{ patch.name }}</option>
        </select>
        <input type="text" v-model="currentPatchName">
      </div>

      <div class="params select">
        <span>0{{ paramsIndex }}</span>

        <button class="math add" @click="addParams">+</button>
        <button class="math remove" @click="removeParams">-</button>

        <select :value="currentParamsKey" @change="selectParams" ref="params">
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
import Auth from './components/system/Auth';
import { mapGetters, mapActions } from 'vuex';

export default {
  components: {
    Auth
  },

  data() {
    return {
      patchIndex: 0,
      paramsIndex: 0
    };
  },

  computed: {
    parameterSets() {
      let patches = this.$store.state.patches;
      let current = this.$store.state.patchKey;

      return patches[current] && patches[current].parameterSets || [];
    },

    currentPatchKey: {
      get() {
        return this.$store.state.patchKey;
      },
      set(key) {
        this.$store.commit('SET_KEY', key);
      }
    },

    currentParamsKey: {
      get() {
        return this.$store.state.parameterKey;
      },
      set(key) {
        this.$store.commit('SET_PARAMETERS_KEY', key);
      }
    },

    currentPatchName: {
      get() {
        return this.$store.state.name;
      },
      set(value) {
        this.$store.commit('SET_NAME', value);
      }
    },

    currentParamsName: {
      get() {
        const key = this.$store.state.parameterKey;
        return (this.$store.state.parameterSets[key] &&
                this.$store.state.parameterSets[key].name);
      },
      set(value) {
        this.$store.commit('SET_PARAMETERS_NAME', value);
      }
    },

    ...mapGetters([
      'patches',
      'editing'
    ])
  },

  mounted() {
    this.load();
  },

  methods: {
    save() {
      this.savePatch();
    },

    load() {
      this.loadPatch();

      this.$nextTick(function() {
        this.$bus.$emit('parameters:load');
        this.$bus.$emit('app:sort');
      });
    },

    add() {
      this.addPatch();                             // CREATE a new blank patch...
      this.loadPatch();                            // ...AND then select it
      this.currentPatch = this.patches.length - 1; // "-1" as our new params are at the end of the list
    },

    remove() {},

    select(e) {
      this.currentPatchKey = e.target.value;
      this.patchIndex = e.target.selectedIndex;
      this.currentParamsKey = 0;                      // always select 1st set when new patch loaded
      this.load();
    },

    addParams() {
      this.$store.commit('ADD_PARAMETERS');
      this.currentParamsKey = this.parameterSets.length - 1;
    },

    removeParams(id) {
      this.$store.commit('REMOVE_PARAMETERS', this.currentParamsKey);
      this.currentParamsKey = -1;
    },

    selectParams(e) {
      this.currentParamsKey = e.target.value;
      this.paramsIndex = e.target.selectedIndex - 1;
      this.$store.commit('SET_PARAMETERS_KEY', this.paramsIndex);
      this.$bus.$emit('parameters:load');
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

    .dropdowns {
      display: flex;
      flex: 0 1 100%;
      justify-content: center;
    }

    .save {
      align-self: center;
      padding: 2px 8px;

      svg {
        display: block;
        height: 2em;
      }
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
        pointer-events: none;
      }
    }

    .math {
      display: none;
      font-size: 1em;
      width: 20px;
      position: absolute;
      cursor: pointer;
      height: 50%;
      line-height: 0;
      z-index: 1;

      &.add {
        top: 0;
      }

      &.remove {
        bottom: 0;
      }

      &:hover {
        color: orange;
      }
    }

    &.editing {
      .math {
        display: block;
      }

      input {
        left: $gap;
      }
    }

    &:not(.active) {
      .dropdowns,
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
      left: 12px;
      right: $gap;
      top: 0;
      transition: left $transition-time-slow;

      &:focus { outline: none; }
    }

    span {
      font: 3.2em/0.65em $font-secondary;
      font-weight: bold;
      letter-spacing: -0.05em;
      position: absolute;
      right: 0.4em;
      opacity: 0.1;
    }
  }
</style>
