<template>
  <div class="env">
    <div class="module-details">
      <h3>Env</h3>
    </div>

    <div class="module-interface">
      <knob param="attack"  @value="setAttack"  :min="0.01" :max="1" :default="0.1" :precision="2"></knob>
      <knob param="decay"   @value="setDecay"   :min="0.01" :max="1" :default="0.2" :precision="2"></knob>
      <knob param="sustain" @value="setSustain" :min="0.01" :max="1" :default="0.8" :precision="2"></knob>
      <knob param="release" @value="setRelease" :min="0.01" :max="1" :default="0.3" :precision="2"></knob>
    </div>

    <div class="module-connections">
      <Inlets  :ports="inlets"  :id="id"></Inlets>
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, onUnmounted } from 'vue';
  import { Envelope, AmplitudeEnvelope } from 'tone';
  import { debug } from '@/utils/logger';

  export default defineComponent({
    name: 'Env',

    props: {
      id: {
        default: undefined,
        required: true
      }
    },

    setup (props, { expose }) {

      // const env = new AmplitudeEnvelope
      const env = new Envelope({
        //     attack: 0.1,
        //     decay: 0.2,
        //     sustain: 0.5,
        //     release: 0.8,
      });

      const inlets = [
        {
          label: 'gate',
          desc: 'Acts as a trigger for the envelope',
          data: gate
        },
        {
          label: 'signal',
          desc: 'The audio signal to apply the envelope to',
          audio: env
        }
      ];

      const outlets = [
        {
          label: 'out',
          desc: 'An audio envelope signal',
          audio: env
        }
      ];


      onUnmounted(() => {
        env.dispose();
      });

      function setAttack(A: number) {
        env.attack = A;
      }

      function setDecay(D: number) {
        env.decay = D;
      }

      function setSustain(S: number) {
        env.sustain = S;
      }

      function setRelease(R: number) {
        env.release = R;
      }

      function gate(velocity: number) {
        debug('[env] gate', velocity);
        if (velocity) {
          env.triggerAttack(0, velocity);
        } else {
          env.triggerRelease();
        }
      }


      // AUDIO
      expose({
        inlets,
        outlets
      });

      // UI
      return {
        inlets,
        outlets,
        setAttack,
        setDecay,
        setSustain,
        setRelease,
      };

    }
  });
</script>


<style lang="scss">
  .env {
    background: linear-gradient(to bottom, #383633 0%, #32312e 98%, #242320 100%);
    color: #fff;

    .knob {
      fill: #fff;
    }
  }
</style>
