<template>
  <div class="midi" v-if="devices.length">
    <h3>midi infos</h3>
    <select class="midi-in select" @change="onSelect">
      <option selected disabled>&lt;select input&gt;</option>
      <option v-for="value in devices" :value="value._uid" :key="value._uid">
        {{ value.name }}
      </option>
    </select>
  </div>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';
  import { useMidi } from '~/composables/midi';

  export default defineComponent({
    name: 'Midi',
    setup() {
      const { devices, selectDevice } = useMidi();

      function onSelect(event: any) {
        selectDevice(event.target.value);
      }

      return {
        devices,
        onSelect
      };
    }
  });
</script>


<style>
  select.midi-in { width: 92px; }
</style>
