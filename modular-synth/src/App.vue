<template>
  <section>
    <oscillator></oscillator>
  </section>

  <rack></rack>

  <aside>
    <button>EDIT / PLAY</button>

    <div>
      selected Component details / info ? debug?
    </div>

    <button>Audio On</button>
    <!-- <master-out></master-out> -->
    <input id="masterOut1" type="range" min="0.0" max="1.0" step="0.1" value="0.0" />
    <input id="masterOut2" type="range" min="0.0" max="1.0" step="0.1" value="0.0" />

  </aside>
</template>

<script>
import Rack from './components/UI/Rack';
import Oscillator from './components/Oscillator';
import MasterOut from './components/MasterOut';

export default {
  components: {
    Rack,
    Oscillator,
    MasterOut
  }
};
</script>

<style src="assets/scss/styles.scss" lang="scss"></style>
