<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'Button',
    props: {
      active: {
        type: Boolean,
        default: false
      }
    }
  });
</script>

<template>
  <button class="button" :class="{ active }" type="button">
    <slot />
  </button>
</template>

<style>
  .button {
    background: #3a3a3a;
    border: 1px solid #444;
    padding: 2px 6px;
    font-size: 0.7rem;
    color: #888;
    cursor: pointer;
    user-select: none;
    transition: background 0.1s, color 0.1s;
    font-family: inherit;

    &:hover {
      background: #444;
    }

    &.active {
      background: var(--color-highlight);
      color: black;
    }

    &:active {
      filter: brightness(1.2);
    }
  }
</style>
