<template>
  <div
    class="contextmenu"
    :class="{visible: visible}"
    :style="position">

    <div class="add" :class="{active: active === 'add'}">
      <h3>New Module:</h3>
      <ul>
        <!-- <li v-for="module in modules" @click="newModule(module)">{{ module }}</li> -->
        <li @click="newModule('Analyser')">analyser</li>
        <li @click="newModule('Comb')">comb</li>
        <li @click="newModule('Compressor')">compressor</li>
        <li @click="newModule('Delay')">delay</li>
        <li @click="newModule('Drive')">drive</li>
        <li @click="newModule('Env')">ENV</li>
        <li @click="newModule('LFO')">LFO</li>
        <li @click="newModule('Mixer')">mixer</li>
        <li @click="newModule('NoteIn')">note-in</li>
        <li @click="newModule('OSC')">OSC</li>
        <li @click="newModule('Reverb')">reverb</li>
        <li @click="newModule('VCO')">VCO</li>
        <li @click="newModule('VCA')">VCA</li>
        <li @click="newModule('VCF')">VCF</li>
        <li>---</li>
        <li @click="newModule('Node')">• Node</li>
        <li @click="newModule('Debugger')">• debugger</li>
      </ul>
    </div>

    <div class="file" :class="{active: active === 'file'}">
      <h3>File:</h3>
      <ul>
        <li @click="save()">Save</li>
        <li @click="addPatch()">New Patch</li>
        <li @click="addParams()">New Parameter Set</li>
        <li @click="removePatch()">Remove patch</li>
        <li @click="removeParams()">Remove parameter Set</li>
      </ul>
    </div>

  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  data() {
    return {
      active: '',
      coords: []
    };
  },

  computed: {
    visible() {
      return !!this.coords.length;
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

  created() {
    window.addEventListener('click', (e) => {
      this.coords = [];
    });

    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'Escape':
          this.coords = [];
          break;
        default:
          // console.log(e.code);
      }
    });
  },

  mounted() {
    const header = document.querySelector('header');
    const grid = document.querySelector('#modules');

    document.body.addEventListener('contextmenu', (e) => {
      e.preventDefault();

      if (header === e.target || header.contains(e.target)) {
        this.active = 'file';
      } else if (grid === e.target || grid.contains(e.target)) {
        this.active = 'add';
      } else {
        this.coords = [];
        this.active = '';
        return false;
      }

      if (this.editing) {
        this.coords = [e.pageX, e.pageY];
      }
    });
  },

  methods: {
    newModule(type) {
      const offset = document.querySelector('header').offsetHeight;

      this.addModule({
        type,
        coords: [this.coords[0], this.coords[1] - offset]
      });

      this.$bus.$emit('module:add');
    },

    ...mapActions([
      'addModule'
    ])
  }
};
</script>

<style lang="scss">
  @import '../../assets/scss/variables.scss';

  .contextmenu {
    position: fixed;
    visibility: hidden;

    width: 160px;
    border: 1px solid $color-grey-dark;
    border-radius: $border-radius;
    background: $color-grey-light;
    color: $color-grey-dark;

    padding: 0.5em 0;

    z-index: 10000;

    &::before {
      content: '';
      display: block;
      border-radius: 50%;
      background: inherit;
      width: 1em;
      height: 1em;
      z-index: 1;
      position: absolute;
      border: 2px solid red;
      top: -7px;
      left: -7px;
    }

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

    div {
      display: none;
    }

    .active {
      display: block;
    }
  }
</style>
