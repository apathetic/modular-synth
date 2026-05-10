<script lang="ts">
  import { defineComponent, onUnmounted, ref, watch } from 'vue';
  import { gain } from '~/audio';

  export default defineComponent({
    name: 'VCA',

    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {
      const vca = gain(0);
      const level = ref(0.5);
      const muted = ref(false);
      const isLinear = ref(true);
      const isAC = ref(false);

      const inlets = [
        {
          label: 'In',
          audio: vca,
        },
        {
          label: 'CV',
          desc: 'The signal (gain) that will be used to multiply the input',
          audio: vca.gain
        }
      ];

      const outlets = [
        {
          label: 'Out',
          audio: vca
        }
      ];

      watch([level, muted], () => {
        vca.gain.value = muted.value ? 0 : level.value;
      });

      onUnmounted(() => {
        vca.disconnect();
      });

      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        inlets,
        outlets,
        level,
        muted,
        isLinear,
        isAC
      };
    }
  });
</script>


<template>
  <div class="vca">
    <div class="module-details">
      <h3>VCA</h3>
    </div>

    <div class="module-interface">
      <div class="controls">
        <Button
          class="mute"
          :active="muted"
          @mousedown.stop="muted = !muted"
        >
          MUTE
        </Button>

        <Knob
          param="level"
          variant="pointer"
          size="large"
          :min="0"
          :max="1"
          :default="0.5"
          :precision="2"
          @value="level = $event"
        />

        <div class="vca-title">VCA</div>

        <div class="mode-toggles">
          <Button
            class="toggle-box"
            :active="isLinear"
            @mousedown.stop="isLinear = !isLinear"
          >
            LIN
          </Button>

          <Button
            class="toggle-box"
            :active="isAC"
            @mousedown.stop="isAC = !isAC"
          >
            AC
          </Button>
        </div>

        <Knob
          param="gain"
          variant="skirted"
          size="small"
          :min="0"
          :max="1"
          :default="0"
          :precision="2"
        />
      </div>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<style>
  .vca {
    .module-interface {
      background: linear-gradient(to bottom, #eeeeee 0%, #d8d8d8 98%, #b0b0b0 100%);
      border-radius: var(--border-radius);
      color: #333;

      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 140px;
        height: 140px;
        background: #4db6ac;
        border-radius: 50%;
        z-index: 0;
      }
    }

    .controls {
      display: flex !important;
      flex-direction: column;
      align-items: center;
    }

    .mute {
      align-self: flex-start;
      margin: 8px 8px 0;
    }




    .vca-title {
      font-size: 3rem;
      font-weight: 100;
      font-variation-settings: "wdth" 100;
      opacity: 0.8;
    }

    .mode-toggles {
      display: flex;
      gap: 10px;
    }

    .toggle-box {
      border: 1px solid currentColor;

      &:not(.active) { background: none; }

      /* background: none; */
      /* &.active { color: var(--color-highlight); } */
    }
  }
</style>
