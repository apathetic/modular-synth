<template>
  <div class="auth">

    <button v-if="$root.authenticated" @click="signOut" title="sign out" class="ring active"></button>
    <button v-else                     @click="signIn"  title="sign in"  class="ring"></button>

  </div>
</template>

<script>
import { auth, provider } from '../../store/firebase';

export default {
  methods: {
    signIn() {
      auth.signInWithPopup(provider).catch((err) => {
        if (err.code === 'auth/web-storage-unsupported') {
          window.alert(err.message);
        }
      });
    },

    signOut() {
      auth.signOut();
    }
  }
};

</script>

<style lang="scss">
  @import '../../assets/scss/variables.scss';

  .auth {
    // float: left;
    // margin-right: 1em;
    align-self: center;

    button:not(.active) {
      box-shadow: 0 0 0 0 rgba($color-grey-light, 0.7);
      animation: pulse 1s infinite alternate;
    }
  }

  @keyframes pulse {
    to { box-shadow: 0 0 0.8em 0.2em rgba($color-grey-light, 0.7); }
  }

</style>
