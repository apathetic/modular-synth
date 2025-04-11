<template>
  <div class="item select">
    <span>0{{ itemId }}</span>

    <select v-model="itemId" ref="itemRef">
      <option value="" disabled selected>&lt;select patch&gt;</option>
      <option v-for="(item, key) in items" :key="item.id" :value="key">{{ item.name }}</option>
    </select>

    <input type="text" v-model="itemName">

    <button class="add" @click="add">+</button>
    <button class="remove" @click="remove">-</button>
  </div>
    <!-- <Select
      :items="presets"
      :itemId="currentPresetId"
      :itemName="currentPresetName"
      :add="addPreset"
      :remove="removePreset"
    /> -->
</template>



<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import type { ComputedRef, Ref } from 'vue';

  // interface Props {
  //   items: any[],
  //   itemId: ComputedRef,
  //   itemName: ComputedRef,
  //   itemRef: Ref,
  //   add: Function,
  // }

  export default defineComponent({
    props: {

  // foo: { type: String, required: true },

      items: { type: Array, required: true },
      itemId: ComputedRef,
      itemName: ComputedRef,
      itemRef: Ref,
      add: Function,
      remove: Function,
    },
    setup(props) {
      const { items, itemId, itemName, add, remove } = props.module;
      // const itemRef = ref(null);

      return {
        itemRef,
        itemId,
        itemName,
        items,
        add,
        remove
      }
    }
  });
</script>


<style lang="scss">
  @import '@/styles/variables.scss';

  .item {
    color: #fff;
    margin: 0 5px;
    font-size: 1.4em;
    padding:0;

    &.editing {
      button {
        transform: scale(1);
        opacity: 1;
      }

      input {
        pointer-events: all;
      }

      .select {
        &:hover {
          color: inherit;
        }

        &::after {
          display: none;
          // opacity: 0;
        }
      }
    }

    &:hover {
      color: var(--color-highlight);
    }

    &::after {
      content: '▿';  // ▽
      position: absolute;
      right: 7px;
      top: 0;
      pointer-events: none;
    }

    button {
      display: block;

      border-radius: 50%;
      background: var(--color-grey-medium);
      border: 1px solid rgba(black, 0.1);

      font-size: 1em;
      font-family: inherit;

      position: absolute;
      right: 2px;
      height: 1.2em;
      width: 1.2em;

      cursor: pointer;
      line-height: 0;
      z-index: 1;

      opacity: 0;
      transform: scale(0);
      transition: all var(--transition-time-slow);

      &.add {
        top: -4px;
      }

      &.remove {
        bottom: -4px;
      }

      &:hover {
        color: var(--color-highlight);
      }
    }

    select {
      background: none;
      min-width: 16em;
      height: 100%;
      padding-right: var(--gap);
      font-size: inherit;
      color: inherit;
      opacity: 0;
    }

    input {
      font-size: 20px; // inherit;
      font-weight: 100;
      color: inherit;
      border: 0;
      background: none;
      pointer-events: none;
      position: absolute;
      height: 100%;
      left: 12px;
      right: var(--gap);
      transition: left var(--transition-time-slow);

      &:focus {
        outline: none;
      }
    }

    span {
      font: 3em / 0.7em 'Anton';
      height: 100%;
      letter-spacing: 0.05em;
      opacity: 0.25;
      overflow: hidden;
      position: absolute;
      right: var(--gap);
      text-shadow: 1px 1px 2px #000;
    }
  }
</style>
