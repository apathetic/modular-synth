<template>
  <div class="auth">

    <button v-if="authenticated" @click="signOut" title="sign out" class="ring active"></button>
    <button v-else               @click="signIn"  title="sign in"  class="ring"></button>

  </div>
</template>

<script>
// import { auth, provider } from '@/stores/firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
const provider = new GoogleAuthProvider();
const auth = getAuth();

export default {
  methods: {
    signIn() {
      // const auth = getAuth();
      signInWithPopup(auth, provider).catch((err) => {
        if (err.code === 'auth/web-storage-unsupported') {
          window.alert(err.message);
        }
      });
    },

    signOut() {
      // const auth = getAuth();
      auth.signOut();
    }
  }
};

</script>

<style lang="scss">
  .auth {
    align-self: center;

    button:not(.active) {
      box-shadow: 0 0 0 0 rgba(var(--color-grey-light), 0.7);
      animation: pulse 1s infinite alternate;
    }
  }

  @keyframes pulse {
    to { box-shadow: 0 0 0.8em 0.2em rgba(var(--color-grey-light), 0.7); }
  }

</style>
