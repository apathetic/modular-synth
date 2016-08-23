//------------------------------------------------
//  LOAD / SAVE
// -----------------------------------------------

// TODO this is just to get json into the App, dynamically. Will need to make more
// load-friendly ie. proper ajax implementation. Or just bundle json with the App.

<template>
  <button>save</button>
  <select name="load">
    <option value="juno">Juno</option>
    <option value="arp">Arp</option>
    <option v-for="patch in patches" :value="patch.name">{{ patch.name }}</option>
  </select>
  <button>load</button>
</template>

<script>

import * as actions from './vuex/actions';
// import * as patches from './assets/patches';
import FM from './assets/patches/FM';
// import Juno from './assets/patches/Juno';

export default {
  vuex: {
    getters: {
      module: state => state.modules.find(function(module) { return module.id === state.activeModule; })
    },
    actions: actions
  },
  data: {
    patches: [
      FM
    ]
  },
  ready() {
    console.log('asfdfasasdfasdfafsd');
    console.log(FM);
  }
};

</script>

<style lang="scss">


</style>
