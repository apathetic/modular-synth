<template functional>
  <div class="outlets">
    <span v-for="(outlet, index) in ports"
      @mousedown.stop="context.parent.$root.$bus.$emit('connection:start', index, context.parent.id);"
      :data-label="outlet.label"
      :data-port="index"
      class="outlet">
    </span>
  </div>
</template>});

<script>
  export default {
    props: { ports: Array }
  };
</script>