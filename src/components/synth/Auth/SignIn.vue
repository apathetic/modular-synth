<template>
  <div>
    <h2>Sign in to your account</h2>
    <form @submit.prevent="handleSignin">
      <div>
        <label for="email">Email</label>
        <input id="email" type="email" v-model="email" />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" type="password" v-model="password" />
      </div>
      <div>
        <button type="submit">Sign in</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
  import { ref } from 'vue';
  // import { supabase } from '../supabase';
  import { auth } from '@/utils/supabase';

  export default {
    setup() {
      const email = ref('');
      const password = ref('');

      const handleSignin = async () => {
        try {
          // Use the Supabase provided method to handle the signin
          const { error } = await auth.signIn({
            email: email.value,
            password: password.value,
          });
          if (error) throw error;
        } catch (error) {
          alert(error.error_description || error.message);
        }
      };

      return {
        email,
        password,
        handleSignin,
      };
    },
  };
</script>