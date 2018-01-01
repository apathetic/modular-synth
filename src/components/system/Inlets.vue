<template functional>
  <div class="inlets">
    <span v-for="(inlet, index) in ports"
      :data-label="inlet.label"
      :data-port="index"
      class="inlet">
    </span>
  </div>
</template>

<script>
  export default {
    props: { ports: Array }
  };
</script>