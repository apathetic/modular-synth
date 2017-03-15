<template>
  <div class="auth">

    <button v-if="$root.authenticated" @click="signOut" title="sign out" class="ring ring--active"></button>
    <button v-else                     @click="signIn"  title="sign in"  class="ring"></button>

  </div>
</template>

<script>
import { auth } from './store/firebase';

export default {
  methods: {
    signIn() {
      const provider = new auth.GoogleAuthProvider();
      auth().signInWithPopup(provider);
    },

    signOut() {
      auth().signOut();
    }
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
