<template>
  <div class="meter">
    <meter orient="vertical" min="0.0" max="1.0" step="0.1" value="0.0"></meter>
    <meter orient="vertical" min="0.0" max="1.0" step="0.1" value="0.0"></meter>

    <input
      type="range"
      orient="vertical"
      min="{{ min }"}
      max="{{ max }}"
      step="0.1"
      value="0.0"
      @input="update">
    </input>
    {{ value }}
  </div>
</template>


<script>
export default {
  props: {
    label: '',
    value: 0.5,
    min: 0,
    max: 1
  },

  data() {
    return {
      level: 1,
      range: 1
    };
  },

  created() {
  },

  methods: {
    update(e) {
      const gain = e.target.value;

      console.log(gain);
      this.value = gain;
    }
  }
};

</script>


<style lang="scss">

  .meter {
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
