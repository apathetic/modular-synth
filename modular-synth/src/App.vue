<template>
  <section>
    <oscillator></oscillator>
  </section>

  <aside>
    <master-out></master-out>
  </aside>
</template>

<script>
import Oscillator from './components/Oscillator';
import MasterOut from './components/MasterOut';

export default {
  components: {
    Oscillator,
    MasterOut
  }
};
</script>

<style src="assets/scss/styles.scss" lang="scss"></style>
