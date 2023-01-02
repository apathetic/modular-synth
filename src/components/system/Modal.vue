<template>
  <transition name="fx--fade">
    <div
        :class="[{'is-visible': visible}, 'modal']"
        @click="close"
    >
      <button class="modal__close" @click="close"></button>
      <div class="modal__content" @click.stop>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
  export default {
    model: {
      prop: 'visible',
      event: 'visible'
    },
    props: {
      visible: false,
    },
    methods: {
      close() {
        this.$emit('visible', false);
      }
    }
  };
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
