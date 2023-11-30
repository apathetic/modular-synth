<template>
  <div class="outlets">
    <span v-for="(outlet, port) in ports"
      @mousedown.stop="(e) => startConnecting(id, port)"
      :data-label="outlet.label"
      :data-port="port"
      :key="port"
      class="outlet">
    </span>
  </div>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';
  import { useConnection } from '@/composables';
  import type { Outlet } from '@/types';

  export default defineComponent({
    props: {
      ports: Array<Outlet>,
      id: Number
    },
    setup() {
      const { startConnecting } = useConnection();
      return { startConnecting };
    }
  });
</script>