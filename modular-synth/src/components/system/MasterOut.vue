<template>
  <div
    class="module"
    id="master-out"
    @mouseover.stop="setActiveModule(id)"
  >

    <div class="module-interface">
      <Level></Level>
      x{{x}}<br>
      y{{y}}<br>
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
import { setActiveModule, newConnection, updateConnection_ } from '../../vuex/actions';
import Level from '../UI/Level';

export default {
  components: { Level },

  vuex: {
    actions: {
      setActiveModule,
      newConnection,
      updateConnection_
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
          label: 'out-1',
          data: null
        }, {
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

    let BCR = this.$el.getBoundingClientRect();
    this.x = BCR.left;
    this.y = BCR.top;
  }
};
</script>

<style lang="scss">
  #master-out {
    .module-interface {
      padding: 1em;
    }
  }
</style>
