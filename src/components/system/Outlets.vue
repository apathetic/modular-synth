<template>
  <div class="outlets">
    <span v-for="(outlet, index) in ports"
      @mousedown.stop="parent.$root.$bus.$emit('connection:start', index, parent.id);"
      :data-label="outlet.label"
      :data-port="index"
      class="outlet">
    </span>
  </div>
</template>

<script>
  // import { useConnection } from @/composables;
  // const { startConnecting } = useConnection();

  export default {
    props: { ports: Array }
  };
</script>