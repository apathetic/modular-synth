<template>
  <div
    class="contextmenu"
    :class="{visible: visible}"
    :style="position">

    <div class="add" :class="{active: active === 'add'}">
      <h3>New Module:</h3>
      <ul>
        <li v-for="(module, i) in modules" @click="newModule(module)" :key="i">{{ module }}</li>
        <li>---</li>
        <li @click="newModule('Node')">• Node</li>
        <li @click="newModule('Debugger')">• debugger</li>
      </ul>
    </div>

    <!-- <div class="file" :class="{active: active === 'file'}">
      <h3>File:</h3>
      <ul>
        <li @click="save()">Save</li>
        <li @click="addPatch()">New Patch</li>
        <li @click="addParams()">New Parameter Set</li>
        <li @click="removePatch()">Remove patch</li>
        <li @click="removeParams()">Remove parameter Set</li>
      </ul>
    </div> -->

  </div>
</template>


<script lang="ts">
  import { EVENT } from '@/events';
  import * as Modules from '@/components';
  import { useAppStore } from '@/stores/app';

  export default {
    data() {
      return {
        active: '',
        coords: [],
        modules: Object.keys(Modules)
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
      }
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
      const store = useAppStore();
      const header = document.querySelector('header');
      const grid = document.querySelector('#modules');

      document.body.addEventListener('contextmenu', (e) => {
        // return;
        e.preventDefault();

        // if (header === e.target || header.contains(e.target)) {
        //   this.active = 'file';
        // } else
        if (grid === e.target || grid.contains(e.target)) {
          this.active = 'add';
        } else {
          this.coords = [];
          this.active = '';
          return false;
        }

        if (store.isEditing) {
          this.coords = [e.pageX, e.pageY];
        }
      });
    },

    methods: {
      newModule(type) {
        const store = useAppStore();
        const offset = document.querySelector('header').offsetHeight;
        const [x, y] = this.coords;

        store.addModule({
          type,
          x,
          y: y - offset
        });
      }
    }
  };
</script>

<style>
  .contextmenu {
    position: fixed;
    visibility: hidden;

    width: 160px;
    border: 1px solid var(--color-grey-dark);
    border-radius: var(--border-radius);
    background: var(--color-grey-light);
    color: var(--color-grey-dark);

    padding: 0.5em 0;

    z-index: 10000;
  }

  .contextmenu::before {
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

  .contextmenu h3 {
    padding: 0.2em 1em;
  }

  .contextmenu li {
    list-style: none;
    cursor: default;
    font-size: 1.2rem;
    padding: 0.2em 1em;
  }

  .contextmenu li:hover {
    background-color: var(--color-highlight);
  }

  .contextmenu li div {
    display: none;
  }

  .contextmenu li .active {
    display: block;
  }

</style>
