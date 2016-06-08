<template>
  <div class="rack"></div>
</template>


<script>
import GraphCreator from '../../../static/js/graphCreator.js';

export default {
  data() {
    return {
      nodes: [],
      edges: []
    };
  },

  ready() {
    var graph;

    // https://github.com/cjrd/directed-graph-creator/blob/master/index.html
    graph = new GraphCreator(this.$el, this.nodes, this.edges);
    graph.updateGraph();
  },

  methods: {
  }
};

</script>


<style lang="scss">

</style>
