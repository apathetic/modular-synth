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
    /* background: #3a3a3a; */
    background: var(--color-inactive);
    /* border: 1px solid #444; */
    padding: 2px 6px;
    font-size: 0.75rem;
    /* color: #888; */
    color: black;
    cursor: pointer;
    font-family: inherit;
    font-weight: 700;
    min-width: 40px;
    transition: background 0.1s, color 0.1s;
    user-select: none;

    &:hover {
      /* background: #444; */
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
