<template>
  <div
    class="module"
    id="master-out"
    @mouseover.stop="setActiveModule(id)">

    <div class="module-interface">
      <Level></Level>
    </div>

    <div class="module-connections">
      <div class="inlets">
        <span v-for="inlet in inlets"
          data-label="{{ inlet.label }}"
          data-port="{{ $index }}"
          class="inlet">
        </span>
      </div>
    </div>
</template>

<script>
// import { draggable } from '../mixins';
import { setActiveModule, newConnection } from '../../vuex/actions';
import Level from '../UI/Level';
import store from '../../vuex/store';

export default {
  components: { Level },

  vuex: {
    actions: {
      setActiveModule,
      newConnection
    }
  },

  data() {
    return {
      name: 'Master Out',
      id: 0,    // only one of these
      x: 0,     // for connections
      y: 0,
      inlets: [
        {
          port: 0,
          label: 'out-1',
          data: null
        }, {
          port: 1,
          label: 'out-2',
          data: null
        }
      ]
    };
  },

  ready() {
    const out1 = this.context.createGain();
    const out2 = this.context.createGain();

    out1.connect(this.context.destination);
    out2.connect(this.context.destination);

    this.inlets[0].data = out1;
    this.inlets[1].data = out2;

    window.addEventListener('resize', this.determinePosition.bind(this));
    window.addEventListener('load', this.determinePosition.bind(this));
  },

  methods: {
    determinePosition() {
      // TODO use getBoundingClientRect is inconsistent with offsetTop in NODE. update
      const x = this.$el.getBoundingClientRect().left;
      const y = this.$el.offsetTop;

      this.x = x;
      this.y = y;

      let dispatch = store.dispatch;
      // dispatch('MASTER', x, y);
      dispatch('UPDATE_POSITION', 0, x, y);   // move MasterOut into modules...?  No, because will render in App <component>
    }
  }
};
</script>

<style lang="scss">
  #master-out {
    min-width: 100%;
    bottom: 0;
  }
</style>
