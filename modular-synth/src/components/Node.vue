<template>
  <div class="node" :inputs="" :outputs="" v-class="{{ nodeType }}">
    <slot></slot>
  </div>

</template>


<script>

export default {
  data() {
    return {
      nodes: [],
      edges: []
    };
  },

  ready() {
  },

  methods: {
  }
};

</script>


<style lang="scss">

</style>
