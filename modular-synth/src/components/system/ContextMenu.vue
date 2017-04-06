<template>
  <div
    class="contextmenu"
    :class="{visible: visible}"
    :style="position">

    <h3>New Module:</h3>
    <ul>
      <!-- <li v-for="module in modules" @click="newModule(module)">{{ module }}</li> -->
      <li @click="newModule('Node')">Node</li>
      <li @click="newModule('LFO')">LFO</li>
      <li @click="newModule('Env')">env</li>
      <li @click="newModule('Reverb')">reverb</li>
      <li @click="newModule('VCF')">filter</li>
      <li @click="newModule('VCO')">osc</li>
      <li @click="newModule('VCA')">VCA</li>
      <li @click="newModule('Analyser')">analyser</li>
      <li @click="newModule('Comb')">comb</li>
      <li @click="newModule('Mixer')">mixer</li>
      <li @click="newModule('multiply')">multiply</li>
      <li @click="newModule('NoteIn')">note-in</li>
      <li @click="newModule('Signal')">signal</li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    coords: Array
  },

  computed: {
    visible() {
      return !!this.coords.length && this.editing;
    },
    position() {
      return {
        left: this.coords[0] + 'px' || 0,
        top: this.coords[1] + 'px' || 0
      };
    },
    ...mapGetters([
      'editing'
    ])
  },


  // mounted() {
  //   this.$refs.grid.addEventListener('contextmenu', (e) => {
  //     e.preventDefault();
  //
  //     const y = e.pageY - document.querySelector('header').offsetHeight;
  //
  //     this.menuCoords = [e.pageX, y];
  //   });
  // },

  methods: {
    newModule(type) {
      this.$store.commit('ADD_MODULE', { type, coords: this.coords });

      // this.$nextTick(function() {
      //   const id = this.$store.state.id;
      //   const item = this.modules.find((m) => { return m.id === id; });
      //
      //   this.gridList.items = this.modules;
      //   this.gridList.moveItemToPosition(item, [0, 0]);
      // });
    }
  }
};
</script>

<style lang="scss">
  @import '../../assets/scss/variables.scss';

  .contextmenu {
    position: absolute; // fixed;
    visibility: hidden;

    width: 160px;
    border: 1px solid $color-grey-dark;
    border-radius: $border-radius;
    background: $color-grey-light;
    color: $color-grey-dark;

    padding: 0.5em 0;

    z-index: 10000;

    h3 {
      padding: 0.2em 1em;
    }

    li {
      list-style: none;
      cursor: default;
      font-size: 1.2rem;
      padding: 0.2em 1em;

      &:hover {
        background-color: $color-highlight;
      }
    }
  }
</style>
