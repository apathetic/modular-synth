<template>
  <div class="outlets">
      <!-- @mousedown.stop="parent.$root.$bus.$emit('connection:start', index, parent.id);" -->
    <span v-for="(outlet, index) in ports"
      @mousedown.stop="startConnecting(index, id);"
      :data-label="outlet.label"
      :data-port="index"
      :key="index"
      class="outlet">
    </span>
  </div>
</template>

<script>
  import { useConnection } from '@/composables';

  const { startConnecting } = useConnection();

  export default {
    props: { ports: Array, id: Number },
    methods: { startConnecting }
  };
</script>