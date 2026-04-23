<template>
  <div class="clock">
    <div class="module-details">
      <h3>Clock</h3>
    </div>

    <div class="module-interface">
      <button class="transport" type="button" @click="toggleRun">
        {{ running ? '\u25A0' : '\u25B6' }}
      </button>

      <Dropdown
        param="division"
        :options="divisions"
        @value="division = $event">
      </Dropdown>

      <knob
        param="bpm"
        :min="20"
        :max="300"
        :default="120"
        :precision="1"
        @value="bpm = $event">
      </knob>

      <knob
        param="reset"
        :min="0"
        :max="128"
        :default="64"
        :precision="0"
        @value="resetEvery = $event">
      </knob>

      <knob
        param="shuffle"
        :min="0"
        :max="0.5"
        :default="0"
        :precision="2"
        @value="shuffle = $event">
      </knob>

      <button class="reset" type="button" @click="manualReset">reset</button>
    </div>

    <div class="module-connections">
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, ref, watch, onUnmounted } from 'vue';
  import { Clock, type ClockDivision } from '@/audio/modules/clock';

  /*
    Thin UI shell around `Clock`. Owns the refs that back the two data
    outlets (`gate`, `reset`); routing.ts picks them up via `$watch` on the
    component instance, which works on setup-exposed refs the same way it
    does for NoteIn.
  */
  export default defineComponent({
    name: 'Clock',

    props: {
      id: {
        default: undefined,
        required: true,
      },
    },

    setup(_props, { expose }) {
      const divisions: ClockDivision[] = ['4n', '8n', '16n', '32n'];

      // --- reactive state backing the data outlets and UI ---
      const gate      = ref<0 | 1>(0);
      const reset     = ref<0 | 1>(0);
      const running   = ref(false);

      const bpm        = ref(120);
      const division   = ref<ClockDivision>('16n');
      const shuffle    = ref(0);
      const resetEvery = ref(64);

      const clock = new Clock({
        bpm:        bpm.value,
        division:   division.value,
        shuffle:    shuffle.value,
        resetEvery: resetEvery.value,
        onGate: (v) => { gate.value = v; },
        onReset: () => {
          // Brief 1->0 pulse so $watch subscribers see a real transition.
          reset.value = 1;
          setTimeout(() => { reset.value = 0; }, 5);
        },
      });

      watch(bpm,        (v) => { clock.bpm        = v; });
      watch(division,   (v) => { clock.division   = v; });
      watch(shuffle,    (v) => { clock.shuffle    = v; });
      watch(resetEvery, (v) => { clock.resetEvery = v; });

      const outlets = [
        { label: 'gate',  data: 'gate'  },
        { label: 'reset', data: 'reset' },
      ];

      function toggleRun() {
        if (running.value) {
          clock.stop();
          running.value = false;
        } else {
          clock.start();
          running.value = true;
        }
      }

      function manualReset() {
        clock.reset();
      }

      onUnmounted(() => clock.destroy());

      expose({
        outlets,
      });

      return {
        outlets,
        divisions,

        gate,
        reset,
        running,

        bpm,
        division,
        shuffle,
        resetEvery,

        toggleRun,
        manualReset,
      };
    },
  });
</script>


<style>
  .clock {
    background: linear-gradient(to bottom, #2f2e2b 0%, #262522 98%, #1a1917 100%);
    color: #fff;

    .knob {
      fill: #fff;
    }

    button.transport,
    button.reset {
      background: transparent;
      border: 1px solid var(--color-grey-medium);
      color: inherit;
      cursor: pointer;
      padding: 0.25em 0.5em;
    }
  }
</style>
