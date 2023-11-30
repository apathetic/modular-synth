<template>
  <transition name="fx--fade">
    <div
      :class="[{'is-visible': isOpen}, 'modal']"
      @click.stop="close"
    >
      <!-- <button class="modal__close" @click.stop="close"></button> -->
      <div class="modal__content" @click.stop>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>


<script lang="ts">
  import { defineComponent } from 'vue';
  export default defineComponent({
    props: {
      isOpen: Boolean,
    },
    emits: ['update:isOpen'],
    setup (props, { emit }) {

      function close() {
        emit('update:isOpen', false);
      }

      // could do: watch(props.isOpen, () => addEventListener...)
      document.addEventListener('keydown', (e) => {
        if (props.isOpen && e.key === 'Escape') {
          close();
        }
      });

      return {
        close
      }
    }
  });
</script>


<style lang="scss">
  $duration: 0.2s;

  .modal {
    background: rgba(0,0,0, 0.75);
    bottom: 0;
    display: flex;
    left: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
    position: fixed;
    right: 0;
    top: 0;
    transition: opacity var(--duration) ease;
    z-index: -1;

    &__content {
      margin: auto;
      width: 50%;
      max-height: 60vh;
      overflow: auto;
      border-radius: 4px;
      background: #fff;

      color: var(--color-grey-dark);
      padding: 20px;

      transform: translateY(-30px) scale(1.1);
      opacity: 0;
      transition: all var(--duration);
      transition-delay: var(--duration);

      .is-visible & {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    &__close {
      background: none;
      color: #ccc;
      cursor: pointer;
      font: 48px/1em Helvetica;
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 900;

      &::after {
        content: "\00d7";
      }
    }

    &.is-visible {
      opacity: 1;
      pointer-events: all;
      z-index: 10000;
    }
  }
</style>
