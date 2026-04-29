<template>
  <div class="vca">
    <div class="module-details">
      <h3>VCA</h3>
    </div>

    <div class="module-interface">

        <div class="mute-button">MUTE</div>

        <Knob
          param="level"
          variant="pointer"
          size="large"
          :min="0"
          :max="1"
          :default="0.5"
        />

      <div class="vca-title">VCA</div>

      <div class="mode-toggles">
        <div class="toggle-box">LIN</div>
        <div class="toggle-box">AC</div>
      </div>

        <Knob
          param="gain"
          variant="skirted"
          size="small"
          :min="0"
          :max="1"
          :default="0"
        />
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, onUnmounted } from 'vue';
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

      onUnmounted(() => {
        // this.inlets[0].audio.disconnect(); // this is done in Connection
      });

      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        // id: props.id,
        inlets,
        outlets
      };
    }
  });
</script>


<style>
  .vca {
    background: #e0e0e0;
    color: #333;
    overflow: hidden;

    .module-interface {
      position: relative;
      height: 100%;
      display: flex !important;
      flex-direction: column;
      align-items: center;


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




    .mute-button {
      background: #bdbdbd;
      padding: 2px 8px;
      font-size: 0.65rem;
      border-radius: 2px;
      color: #f5f5f5;
    }




    .vca-title {
      font-size: 3rem;
      font-weight: 100;
      opacity: 0.8;
    }

    .mode-toggles {
      display: flex;
      gap: 10px;
    }

    .toggle-box {
      border: 1px solid #333;
      padding: 1px 12px;
      font-size: 0.65rem;
      font-weight: bold;
      background: rgba(255,255,255,0.1);
    }
  }
</style>

