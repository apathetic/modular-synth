<template>
    <oscillator></oscillator>
    <aside>
      <master-out></master-out>
    </aside>
  </main>
</template>

<script>
import Knob from './components/Knob';
import Oscillator from './components/Oscillator';

export default {
  components: {
    Knob,
    Oscillator
  }
};
</script>

<style src="assets/scss/styles.scss" lang="scss"></style>
