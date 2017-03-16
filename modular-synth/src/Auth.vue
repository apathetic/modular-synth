<template>
  <div class="auth">

    <button v-if="$root.authenticated" @click="signOut" title="sign out" class="ring active"></button>
    <button v-else                     @click="signIn"  title="sign in"  class="ring"></button>

  </div>
</template>

<script>
import { auth } from './store/firebase';

export default {
  methods: {
    signIn() {
      const provider = new auth.GoogleAuthProvider();
      auth().signInWithPopup(provider).catch((err) => {
        if (err.code === 'auth/web-storage-unsupported') {
          window.alert(err.message);
        }
      });
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

    button:not(.active) {
      box-shadow: 0 0 0 0 rgba($color-grey-light, 0.7);
      animation: pulse 1s infinite alternate;
    }
  }

  @keyframes pulse {
    to { box-shadow: 0 0 0.4em 0.1em rgba($color-grey-light, 0.7); }
  }

</style>
