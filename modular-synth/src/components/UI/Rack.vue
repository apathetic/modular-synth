<template>
  <div class="rack"></div>
</template>


<script>

// import d3 from 'd3/d3.js';
import GraphCreator from '../../../static/js/graphCreator.js';

export default {
  props: {
  },

  data() {
    return {
      nodes: [],
      edges: []
    };
  },

  ready() {
    /*
      // handle download data
      d3.select("#download-input").on("click", function(){
        var saveEdges = [];
        thisGraph.edges.forEach(function(val, i){
          saveEdges.push({source: val.source.id, target: val.target.id});
        });
        var blob = new Blob([window.JSON.stringify({"nodes": thisGraph.nodes, "edges": saveEdges})], {type: "text/plain;charset=utf-8"});
        saveAs(blob, "mydag.json");
      });

      // handle uploaded data
      d3.select("#upload-input").on("click", function(){
        document.getElementById("hidden-file-upload").click();
      });

      d3.select("#hidden-file-upload").on("change", function(){
        if (window.File && window.FileReader && window.FileList && window.Blob) {
          var uploadFile = this.files[0];
          var filereader = new window.FileReader();

          filereader.onload = function(){
            var txtRes = filereader.result;
            // TODO better error handling
            try{
              var jsonObj = JSON.parse(txtRes);
              thisGraph.deleteGraph(true);
              thisGraph.nodes = jsonObj.nodes;
              thisGraph.setIdCt(jsonObj.nodes.length + 1);
              var newEdges = jsonObj.edges;
              newEdges.forEach(function(e, i){
                newEdges[i] = {source: thisGraph.nodes.filter(function(n){return n.id == e.source;})[0],
                            target: thisGraph.nodes.filter(function(n){return n.id == e.target;})[0]};
              });
              thisGraph.edges = newEdges;
              thisGraph.updateGraph();
            }catch(err){
              window.alert("Error parsing uploaded file\nerror message: " + err.message);
              return;
            }
          };
          filereader.readAsText(uploadFile);

        } else {
          alert("Your browser won't let you save this graph -- try upgrading your browser to IE 10+ or Chrome or Firefox.");
        }

      });

      // handle delete graph
      d3.select("#delete-graph").on("click", function(){
        thisGraph.deleteGraph(false);
      });
    */

    // var svg;
    var graph;

    // var docEl = document.documentElement,
    //     bodyEl = document.getElementsByTagName('body')[0];

    // var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
    //     height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
    // var width = this.$el.getBoundingClientRect().width;
    // var height = this.$el.getBoundingClientRect().height;

    // var xLoc = width/2 - 25,
    //     yLoc = 100;

    // initial node data
    // var nodes = [];
    // var edges = [];


    /** MAIN SVG **/
    // svg = d3.select(rackID).append('svg')
    //       .attr('width', width)
    //       .attr('height', height);


    graph = new GraphCreator(this.$el, this.nodes, this.edges);
    graph.setIdCt(2);
    graph.updateGraph();
  },

  created() {


  },

  methods: {
  }
};

</script>


<style lang="scss">

</style>
