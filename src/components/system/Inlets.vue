<template>
  <div class="inlets">
    <span v-for="(inlet, port) in ports"
      @mouseup="() => stopConnecting(id, port)"
      :data-label="inlet.label"
      :data-port="port"
      :key="port"
      class="inlet">
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
      const { stopConnecting } = useConnection();
      return { stopConnecting }
    }
  });
</script>
