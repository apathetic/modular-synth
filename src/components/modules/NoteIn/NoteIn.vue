<template>
  <div class="note-in">
    <div class="module-details">
      <h3>NoteIn</h3>
    </div>

    <div class="module-interface">
      <span class="received" :class="{active: gate}"></span>

      <p>note: {{ noteName }}</p>
      <p>pitch: {{ Math.round(pitch) }} Hz</p>
      <p>gate: {{ gate }}</p>
      <p>vel:  {{ velocity }}</p>
      <p>bend: {{ bend }}</p>
      <p>mod:  {{ mod }}</p>
    </div>

    <div class="module-connections">
      <Outlets :ports="outlets" :id="id"></Outlets>
    </div>
  </div>
</template>


<script lang="ts">
  import { defineComponent, computed, ref, onUnmounted } from 'vue';
  import { useEventBus, useKeyboard } from '@/composables';
  import sync from './worker';
  // import rollover from './rollover';

  const noteNames: string[] = [];
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  for (let i = 0; i < 127; i++) {
    let key = notes[i % 12] + '-';
    const octave = ((i / 12) | 0) - 1; // MIDI scale starts at octave = -1

    key += octave;
    noteNames[i] = key;
  }

  export default defineComponent({
    name: 'NoteIn',
    props: {
      id: null
    },

    setup (props, { expose }) {
      const note = ref(0);
      const pitch = ref(440);
      const gate = ref(0);
      const velocity = ref(0);
      const mod = ref(0);
      const bend = ref(0);
      const noteName = computed(() => noteNames[note.value] || '');


      const outlets = [
        { label: 'pitch', data: 'pitch' },
        { label: 'gate',  data: 'gate' },     // binary 0|1
        { label: 'vel',   data: 'velocity' }, // 0–1 float
        // { label: 'bend',  data: 'bend' },
        { label: 'mod',   data: 'mod' },
      ];


      const bus = useEventBus('midi');
      // const bus = useMidi();
      // const bus = useOSC();
      // const sw = useSW();

      // call `unsubscribe` to stop listening for events
      const unsubscribeMIDI = bus.on((event, ...payload) => {
        console.log(`news: ${event}`, payload);
      });

      const unsubcribeKeys = useKeyboard({ noteOn, noteOff });


      /**
       * [noteOn description]
       * @param  {number} note     Midi note.
       * @param  {number} velocity Midi velocity beteen 1 - 127.
       */
      function noteOn(n: number, v: number) {
        note.value = n;
        pitch.value = 440 * (Math.pow(2, ((n - 69) / 12)));
        velocity.value = (v / 127.0);
        gate.value = 1;
        sync({ note: n, velocity: v });
      }

      function noteOff(n: number) {
        if (n === note.value) {
          gate.value = 0;
          velocity.value = 0;
          sync({ note: n, velocity: 0 });
        }
      }

      function pitchWheel(b: number) {
        bend.value = +b.toFixed(3);
      }

      function controller(target, val: number) {
        mod.value = (val / 127.0);
      }

      onUnmounted(() => {
        unsubscribeMIDI();
        unsubcribeKeys();
        // unsubOSC();
        // unsubSW()
      });

      // DATA / AUDIO
      expose({
        outlets
      });

      // UI
      return {
        outlets,
        noteName,
        pitch,
        gate,
        velocity,
        bend,
        mod,
      };
    }

  });
</script>

<style>
  /* @import 'styles/variables.scss'; */
  .note-in {
    .received {
      display: block;
      border-radius: 1em;
      width: 2em;
      height: 2em;
      background: var(--color-grey-medium);

      &.active {
        background: var(--color-green);
      }
    }
  }
</style>
