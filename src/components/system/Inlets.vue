<template functional>
  <div class="inlets">
    <span v-for="(inlet, index) in props.ports"
      :data-label="inlet.label"
      :data-port="index"
      class="inlet">
    </span>
  </div>
</template>

<script lang="ts">
  // export default class inlets extends Vue {
  export default {
    // @Prop() ports: Array;
    // props: { ports: Array }
  };
</script>