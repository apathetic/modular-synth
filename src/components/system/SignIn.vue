<template>
  <div>
    <modal v-model="showModal">
      <input
        type="text"
        v-model="email"
        placeholder="Email address"
        class="input"
        required>
      <br/>
      <input
        type="password"
        v-model="password"
        placeholder="Password"
        class="input"
        required>
      <br/>
      <button @click="login" class="button">Enter</button>
    </modal>

    <button
      @click="showModal = true"
      :class="[{'active': $root.isAuthenticated}, 'ring', 'active']"
    >
    </button>

  </div>
</template>


<script lang="ts">
import Modal from './Modal';
import { auth } from '@/utils/firebase';

export default {
  name: 'SignIn',
  components: {
    Modal,
  },
  data() {
    return {
      showModal: false,
      email: '',
      password: ''
    };
  },
  methods: {
    login() {
      auth.signInWithEmailAndPassword(this.email, this.password).then((user) => {
        this.showModal = false;
      }).catch((err) => {
        alert(err.message);
      });
    }
  }
};
</script>