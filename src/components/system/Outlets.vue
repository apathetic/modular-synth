<template>
  <div class="outlets">
    <span v-for="(outlet, index) in props.ports"
      @mousedown.stop="parent.$root.$bus.$emit('connection:start', index, parent.id);"
      :data-label="outlet.label"
      :data-port="index"
      class="outlet">
    </span>
  </div>
</template>

<script>
  export default {
    // props: { ports: Array }
  };
</script>