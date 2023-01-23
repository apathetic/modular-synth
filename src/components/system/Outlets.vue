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

<script>
  import { defineComponent } from 'vue';
  import { useConnection } from '@/composables';

  export default defineComponent({
    props: { ports: Array, id: Number },
    setup() {
      const { startConnecting } = useConnection();
      return { startConnecting };
    }
  });
</script>