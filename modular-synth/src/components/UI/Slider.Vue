<template>
  <div class="slider">
    <input
      type="range"
      orient="vertical"
      min="{{ min }"}
      max="{{ max }}"
      step="{{ step }}"
      value="{{ value }}"
      @input.stop.prevent="update">
    </input>
    {{ value }}
  </div>
</template>


<script>
export default {
  props: {
    label: 'Slider',
    value: 0,
    min: 0,
    max: 100
  },

  data() {
    return {
      active: false,
      // sliderValue: 1,
      step: 1
    };
  },

  methods: {
    update(e) {
      this.value = e.target.value;
    }
  }
};

</script>


<style lang="scss">


</style>
