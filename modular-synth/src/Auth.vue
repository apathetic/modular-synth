<template>
  <div class="auth">

    <button v-if="signedIn" @click="signOut" title="sign out" class="ring ring--active"></button>
    <button v-else          @click="signIn"  title="sign in"  class="ring"></button>

  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters([
      'signedIn'
    ])
  },
  methods: {
    ...mapActions([
      'signIn',
      'signOut'
    ])
  }
};

</script>

<style lang="scss">
  @import 'assets/scss/variables.scss';

  .auth {
    float: left;
    margin-right: 1em;
  }

  // .modal {
  //   background: #000;
  //   display: none;
  //   z-index: 10000;
  //   position: fixed;
  //   top: 0;
  //   bottom: 0;
  //   left: 0;
  //   right: 0;
  //
  //   &.active {
  //     display: block;
  //   }
  // }
</style>
