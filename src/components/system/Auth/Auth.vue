<template>
  <div class="auth">

    <button v-if="isAuthenticated" @click="signOut" title="sign out" class="ring active"></button>
    <button v-else                 @click="signIn"  title="sign in"  class="ring"></button>

    <Modal v-model:isOpen="showModal">
      <Signin />
      or
      <br /><br />
      <Login />
    </Modal>
  </div>
</template>


<script lang="ts">
  // import { auth, provider } from '@/stores/firebase';
  // import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
  // const provider = new GoogleAuthProvider();
  // const auth = getAuth();

  import Login from './Login.vue';
  import Signin from './SignIn.vue';
  import Modal from '../Modal.vue';
  import { useAppStore } from '@/stores/app';
  import { mapState } from 'pinia';


  export default {
    components: { Modal, Login, Signin },
    data() {
      return {
        showModal: false
      }
    },
    computed: {
      ...mapState(useAppStore, [
        'isAuthenticated'
      ])
    },
    methods: {
      signIn() {
        // const auth = getAuth();
        // signInWithPopup(auth, provider).catch((err) => {
        //   if (err.code === 'auth/web-storage-unsupported') {
        //     window.alert(err.message);
        //   }
        // });
        this.showModal = true;
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
