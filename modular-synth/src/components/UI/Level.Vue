<template>
  <div class="level">
    <meter orient="vertical" min="0.0" max="1.0" step="0.1" value="0.0"></meter>
    <meter orient="vertical" min="0.0" max="1.0" step="0.1" value="0.0"></meter>

    <input type="range" orient="vertical" min="0.0" max="1.0" step="0.1" value="0.0"></input>
    <button>mute</button>
  </div>
</template>


<script>
export default {
  props: {
    'value': 0,
    'min': 0,
    'max': 100
  },

  data() {
    return {
    };
  },

  created() {
  },

  methods: {
    update(e) {
      console.log(e.target);

      let change = this.startClientY - e.clientY;
      let value = this.startValue + change;
      console.log(value);
    }
  }
};

</script>


<style lang="scss">

  .level {
    display: inline-block;
  }

  meter,
  input[type="range"] {
    writing-mode: bt-lr; /* IE */
    -webkit-appearance: slider-vertical; /* WebKit */

    background: #aaa;
    padding: 0 5px;

    height: 150px;
    width: 20px;

    &:-webkit-slider-thumb {
      background-color: red;
      -webkit-appearance: none;
      border: 1px solid #000000;
    }

    &:focus {
      outline: none;
    }
  }
</style>
