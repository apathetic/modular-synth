<template functional>
  <div class="outlets">
    <span v-for="(outlet, index) in props.ports"
      @mousedown.stop="context.parent.$root.$bus.$emit('connection:start', index, context.parent.id);"
      :data-label="outlet.label"
      :data-port="index"
      class="outlet">
    </span>
  </div>
</template>

<script lang="ts">
  export default {
    // props: { ports: Array }
  };
</script>