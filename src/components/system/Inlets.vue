<template>
  <div class="inlets">
    <span v-for="(inlet, index) in ports"
      @mouseup.stop="stopConnecting(index, id);"
      :data-label="inlet.label"
      :data-port="index"
      :key="index"
      class="inlet">
    </span>
  </div>
</template>

<script>
  export default {
    props: { ports: Array },
    methods: {
      stopConnecting(port, id) { console.log('stop', port, id) }
    }
  };
</script>
